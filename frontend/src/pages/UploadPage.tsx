import { useState, useRef, type ChangeEvent, type DragEvent } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { UploadCloud, FileText, X, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { previewImport, commitImport } from '../api/upload';
import type { PreviewResponse } from '../api/upload';

type Stage = 'select' | 'previewing' | 'preview-ready' | 'committing' | 'done';

function UploadCard({ title, description, endpoint }: { title: string; description: string; endpoint: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [stage, setStage] = useState<Stage>('select');
  const [preview, setPreview] = useState<PreviewResponse | null>(null);
  const [result, setResult] = useState<Record<string, number> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  function selectFile(selected: File | null) {
    setFile(selected);
    setPreview(null);
    setResult(null);
    setError(null);
    setStage('select');
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    selectFile(e.target.files?.[0] ?? null);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped && dropped.name.endsWith('.xlsx')) {
      selectFile(dropped);
    } else {
      toast.error('Only .xlsx files are supported');
    }
  }

  async function handlePreview() {
    if (!file) return;
    setStage('previewing');
    setError(null);
    try {
      const data = await previewImport(`${endpoint}/preview`, file);
      setPreview(data);
      setStage('preview-ready');
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? 'Failed to read file');
      setStage('select');
    }
  }

  async function handleConfirm() {
    if (!preview) return;
    setStage('committing');
    try {
      const data = await commitImport(`${endpoint}/commit`, preview.records);
      setResult(data.summary);
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      queryClient.invalidateQueries({ queryKey: ['filter-options'] });
      toast.success('Import completed');
      setStage('done');
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? 'Import failed');
      setStage('preview-ready');
    }
  }

  function reset() {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    setStage('select');
  }

  return (
    <div className="bg-surface rounded-xl border border-border-subtle shadow-sm p-6">
      <h2 className="font-semibold text-gray-800 mb-1">{title}</h2>
      <p className="text-sm text-gray-500 mb-4">{description}</p>

      {stage === 'select' && !file && (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg py-10 flex flex-col items-center justify-center cursor-pointer transition-colors ${
            isDragging ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <UploadCloud className="w-8 h-8 text-gray-400 mb-2" />
          <p className="text-sm text-gray-600">Drag and drop your file here, or click to browse</p>
          <p className="text-xs text-gray-400 mt-1">Supports .xlsx</p>
          <input ref={fileInputRef} type="file" accept=".xlsx" onChange={handleFileChange} className="hidden" />
        </div>
      )}

      {file && stage !== 'done' && (
        <div className="border border-gray-200 rounded-lg p-4 flex items-center justify-between mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <FileText className="w-5 h-5 text-primary shrink-0" />
            <div className="min-w-0">
              <p className="text-sm text-gray-800 truncate">{file.name}</p>
              <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(0)} KB</p>
            </div>
          </div>
          {stage === 'select' && (
            <button onClick={() => selectFile(null)} className="text-gray-400 hover:text-gray-600" aria-label="Remove file">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {stage === 'select' && file && (
        <button onClick={handlePreview} className="bg-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-hover flex items-center gap-1.5">
          Preview Import <ArrowRight className="w-3.5 h-3.5" />
        </button>
      )}

      {stage === 'previewing' && <p className="text-sm text-gray-500">Reading file...</p>}

      {stage === 'preview-ready' && preview && (
        <div className="space-y-3">
          <div className="bg-app-bg rounded-lg p-3 flex gap-6">
            <div><p className="text-xs text-gray-500">Total rows</p><p className="text-lg font-semibold text-gray-800">{preview.preview.total_records}</p></div>
            <div><p className="text-xs text-gray-500">Will add</p><p className="text-lg font-semibold text-success">{preview.preview.would_add}</p></div>
            <div><p className="text-xs text-gray-500">Will update</p><p className="text-lg font-semibold text-primary">{preview.preview.would_update}</p></div>
          </div>

          {preview.report?.uncertain_classifications && preview.report.uncertain_classifications.length > 0 && (
            <div className="bg-warning-bg border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800 font-medium mb-1">
                {preview.report.uncertain_classifications.length} item(s) need review after import
              </p>
              <ul className="text-xs text-yellow-700 space-y-0.5 max-h-24 overflow-y-auto">
                {preview.report.uncertain_classifications.map((msg, i) => <li key={i}>{msg}</li>)}
              </ul>
            </div>
          )}

          {preview.report?.skipped_rows && preview.report.skipped_rows.length > 0 && (
            <div className="bg-danger-bg border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800 font-medium mb-1">{preview.report.skipped_rows.length} row(s) will be skipped</p>
              <ul className="text-xs text-red-700 space-y-0.5 max-h-24 overflow-y-auto">
                {preview.report.skipped_rows.map((msg, i) => <li key={i}>{msg}</li>)}
              </ul>
            </div>
          )}

          <div className="flex gap-2">
            <button onClick={reset} className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md">Cancel</button>
            <button onClick={handleConfirm} className="bg-primary text-white px-4 py-1.5 rounded-md text-sm hover:bg-primary-hover">
              Confirm Import
            </button>
          </div>
        </div>
      )}

      {stage === 'committing' && <p className="text-sm text-gray-500">Importing...</p>}

      {stage === 'done' && result && (
        <div className="space-y-2">
          <div className="bg-success-bg border border-green-200 rounded-lg p-3">
            <ul className="text-xs text-green-700 grid grid-cols-2 gap-x-4">
              {Object.entries(result).map(([key, value]) => (
                <li key={key}>{key.replace(/_/g, ' ')}: {value}</li>
              ))}
            </ul>
          </div>
          <button onClick={reset} className="text-sm text-primary hover:underline">Import another file</button>
        </div>
      )}

      {error && <p className="text-danger text-sm mt-3">{error}</p>}
    </div>
  );
}

export default function UploadPage() {
  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-xl font-bold text-gray-800">Upload Assets</h1>
      <UploadCard
        title="Standard Asset Template"
        description="Clean template with one row per asset (asset_code, name, category, etc.)"
        endpoint="/upload"
      />
      <UploadCard
        title="Hardware List (per-person format)"
        description="Wide-format company hardware list, one row per person"
        endpoint="/upload/hardware-list"
      />
    </div>
  );
}