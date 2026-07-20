import apiClient from './client';

export interface ImportRecord {
  asset_code: string;
  name: string;
  commodity_type?: string | null;
  location?: string | null;
  status?: string | null;
  assigned_user_name?: string;
  [key: string]: unknown;
}

export interface ImportReport {
  unmapped_columns?: string[];
  skipped_rows?: string[];
  uncertain_classifications?: string[];
}

export interface PreviewResponse {
  records: ImportRecord[];
  report?: ImportReport;
  preview: {
    total_records: number;
    would_add: number;
    would_update: number;
  };
}

export interface CommitResponse {
  message: string;
  summary: Record<string, number>;
}

export async function previewImport(endpoint: string, file: File): Promise<PreviewResponse> {
  const formData = new FormData();
  formData.append('file', file);
  const response = await apiClient.post<PreviewResponse>(endpoint, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

export async function commitImport(endpoint: string, records: ImportRecord[]): Promise<CommitResponse> {
  const response = await apiClient.post<CommitResponse>(endpoint, { records });
  return response.data;
}