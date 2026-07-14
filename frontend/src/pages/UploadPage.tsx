import { useState, type ChangeEvent } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import Navbar from '../components/Navbar';

interface UploadResult {
  message: string;
  summary: Record<string, number>;
}

function UploadCard({ title, description, endpoint }: { title: string; description: string; endpoint: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const queryClient = useQueryClient();

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    setFile(e.target.files?.[0] ?? null);
    setResult(null);
    setError(null);
  }

  async function handleUpload() {
    if (!file) return;
    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await apiClient.post<UploadResult>(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(response.data);
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['filter-options'] });
      setFile(null);
    } catch {
      setError('Upload failed. Check the file format and try again.');
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="font-semibold text-gray-800 mb-1">{title}</h2>
      <p className="text-sm text-gray-500 mb-4">{description}</p>

      <input type="file" accept=".xlsx" onChange={handleFileChange} className="text-sm mb-4" />

      <button
        onClick={handleUpload}
        disabled={!file || isUploading}
        className="block bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 disabled:bg-blue-300"
      >
        {isUploading ? 'Uploading...' : 'Upload'}
      </button>

      {error && <p className="text-red-600 text-sm mt-3">{error}</p>}

      {result && (
        <div className="mt-4 bg-green-50 border border-green-200 rounded p-3">
          <p className="text-sm text-green-800 mb-1">{result.message}</p>
          <ul className="text-xs text-green-700">
            {Object.entries(result.summary).map(([key, value]) => (
              <li key={key}>{key.replace(/_/g, ' ')}: {value}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function UploadPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
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
    </div>
  );
}