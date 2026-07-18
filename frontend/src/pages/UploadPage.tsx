import { useState, useRef, type ChangeEvent, type DragEvent } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { UploadCloud, FileText, X } from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient from '../api/client';


interface UploadResult {
  message: string;
  summary: Record<string, number>;
}

function UploadCard({ title, description, endpoint }: { title: string; description: string; endpoint: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  function selectFile(selected: File | null) {
    setFile(selected);
    setResult(null);
    setError(null);
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

  async function handleUpload() {
    if (!file) return;
    setIsUploading(true);
    setError(null);
    setProgress(0);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await apiClient.post<UploadResult>(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (event) => {
          if (event.total) {
            setProgress(Math.round((event.loaded / event.total) * 100));
          }
        },
      });
      setResult(response.data);
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['filter-options'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      setFile(null);
      toast.success('File processed successfully');
    } catch {
      setError('Upload failed. Check the file format and try again.');
      toast.error('Upload failed');
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="font-semibold text-gray-800 mb-1">{title}</h2>
      <p className="text-sm text-gray-500 mb-4">{description}</p>

      {!file ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg py-10 flex flex-col items-center justify-center cursor-pointer transition-colors ${
            isDragging ? 'border-primary bg-blue-50' : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <UploadCloud className="w-8 h-8 text-gray-400 mb-2" />
          <p className="text-sm text-gray-600">Drag and drop your file here, or click to browse</p>
          <p className="text-xs text-gray-400 mt-1">Supports .xlsx</p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      ) : (
        <div className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <FileText className="w-5 h-5 text-primary shrink-0" />
            <div className="min-w-0">
              <p className="text-sm text-gray-800 truncate">{file.name}</p>
              <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(0)} KB</p>
            </div>
          </div>
          {!isUploading && (
            <button onClick={() => selectFile(null)} className="text-gray-400 hover:text-gray-600" aria-label="Remove file">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {isUploading && (
        <div className="mt-3">
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all duration-150" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-xs text-gray-400 mt-1">{progress}%</p>
        </div>
      )}

      {file && !isUploading && (
        <button
          onClick={handleUpload}
          className="mt-4 bg-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-hover transition-colors"
        >
          Upload
        </button>
      )}

      {error && <p className="text-danger text-sm mt-3">{error}</p>}

      {result && (
        <div className="mt-4 bg-success-bg border border-green-200 rounded-lg p-3">
          <p className="text-sm text-green-800 mb-1">{result.message}</p>
          <ul className="text-xs text-green-700 grid grid-cols-2 gap-x-4">
            {Object.entries(result.summary).map(([key, value]) => (
              <li key={key}>{key.replace(/_/g, ' ')}: <span className="font-medium">{value}</span></li>
            ))}
          </ul>
        </div>
      )}
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
        endpoint="/upload/"
      />
      <UploadCard
        title="Hardware List (per-person format)"
        description="Wide-format company hardware list, one row per person"
        endpoint="/upload/hardware-list"
      />
    </div>
  );
}