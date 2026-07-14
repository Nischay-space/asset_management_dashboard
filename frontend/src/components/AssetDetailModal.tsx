import { useState, type ChangeEvent } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getAsset } from '../api/assets';
import { getInvoices, uploadInvoice, deleteInvoice, downloadInvoice } from '../api/invoices';
import { useAuth } from '../context/AuthContext';
import Modal from './Modal';
import StatusBadge from './StatusBadge';
import { orDash } from '../utils/format';
import EmptyState from './EmptyState';

interface AssetDetailModalProps {
  assetId: number;
  onClose: () => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AssetDetailModal({ assetId, onClose }: AssetDetailModalProps) {
  const { role } = useAuth();
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);

  const { data: asset, isLoading } = useQuery({
    queryKey: ['asset', assetId],
    queryFn: () => getAsset(assetId),
  });

  const { data: invoices } = useQuery({
    queryKey: ['invoices', assetId],
    queryFn: () => getInvoices(assetId),
  });

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      await uploadInvoice(assetId, file);
      queryClient.invalidateQueries({ queryKey: ['invoices', assetId] });
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  }

  async function handleDelete(invoiceId: number) {
    await deleteInvoice(invoiceId);
    queryClient.invalidateQueries({ queryKey: ['invoices', assetId] });
  }

  return (
    <Modal onClose={onClose}>
      {isLoading && <p className="text-gray-500">Loading...</p>}
      {asset && (
        <div>
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-800">{asset.name}</h2>
              <p className="text-sm text-gray-500">{asset.asset_code}</p>
            </div>
            <StatusBadge isActive={asset.is_active} />
          </div>

          <dl className="grid grid-cols-2 gap-3 text-sm mb-4">
            <div><dt className="text-gray-500">Category</dt><dd className="text-gray-800">{orDash(asset.category)}</dd></div>
            <div><dt className="text-gray-500">Type</dt><dd className="text-gray-800">{orDash(asset.commodity_type)}</dd></div>
            <div><dt className="text-gray-500">Brand</dt><dd className="text-gray-800">{orDash(asset.brand_name)}</dd></div>
            <div><dt className="text-gray-500">Model</dt><dd className="text-gray-800">{orDash(asset.model_name)}</dd></div>
            <div><dt className="text-gray-500">Serial Number</dt><dd className="text-gray-800">{orDash(asset.serial_number)}</dd></div>
            <div><dt className="text-gray-500">Location</dt><dd className="text-gray-800">{orDash(asset.location)}</dd></div>
          </dl>

          <div className="pt-4 border-t border-gray-100 mb-4">
            <p className="text-sm text-gray-500 mb-1">Assigned to</p>
            <p className="text-sm text-gray-800">
              {asset.assigned_users.length > 0 ? asset.assigned_users.map((u) => u.name).join(', ') : 'Unassigned'}
            </p>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-semibold text-gray-700">Invoices</p>
              {role === 'admin' && (
                <label className="text-xs text-blue-600 hover:underline cursor-pointer">
                  {isUploading ? 'Uploading...' : '+ Add invoice'}
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} className="hidden" disabled={isUploading} />
                </label>
              )}
            </div>

            {invoices && invoices.length === 0 && (
              <EmptyState message="No invoices attached." />
            )}

            {invoices && invoices.length > 0 && (
              <ul className="space-y-2">
                {invoices.map((invoice) => (
                  <li key={invoice.id} className="flex justify-between items-center bg-gray-50 rounded px-3 py-2 text-sm">
                    <button
                      onClick={() => downloadInvoice(invoice.id, invoice.file_name)}
                      className="text-blue-600 hover:underline text-left truncate max-w-[180px]"
                    >
                      {invoice.file_name}
                    </button>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>{formatFileSize(invoice.file_size)}</span>
                      {role === 'admin' && (
                        <button onClick={() => handleDelete(invoice.id)} className="text-red-500 hover:underline">
                          Delete
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}