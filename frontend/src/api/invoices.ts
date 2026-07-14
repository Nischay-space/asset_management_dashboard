import apiClient from './client';

export interface Invoice {
  id: number;
  file_name: string;
  file_size: number;
  file_type: string;
  uploaded_at: string;
  notes: string | null;
}

export async function getInvoices(assetId: number): Promise<Invoice[]> {
  const response = await apiClient.get<Invoice[]>(`/assets/${assetId}/invoices`);
  return response.data;
}

export async function uploadInvoice(assetId: number, file: File): Promise<Invoice> {
  const formData = new FormData();
  formData.append('file', file);
  const response = await apiClient.post<Invoice>(`/assets/${assetId}/invoices`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

export async function deleteInvoice(invoiceId: number): Promise<void> {
  await apiClient.delete(`/invoices/${invoiceId}`);
}

export async function downloadInvoice(invoiceId: number, fileName: string): Promise<void> {
  const response = await apiClient.get(`/invoices/${invoiceId}/download`, {
    responseType: 'blob',
  });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  window.URL.revokeObjectURL(url);
}