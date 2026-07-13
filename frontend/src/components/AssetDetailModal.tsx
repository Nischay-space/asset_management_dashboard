import { useQuery } from '@tanstack/react-query';
import { getAsset } from '../api/assets';
import Modal from './Modal';

interface AssetDetailModalProps {
  assetId: number;
  onClose: () => void;
}

export default function AssetDetailModal({ assetId, onClose }: AssetDetailModalProps) {
  const { data: asset, isLoading } = useQuery({
    queryKey: ['asset', assetId],
    queryFn: () => getAsset(assetId),
  });

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
            <span className={`text-xs px-2 py-1 rounded ${asset.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
              {asset.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>

          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div><dt className="text-gray-500">Category</dt><dd className="text-gray-800">{asset.category ?? '—'}</dd></div>
            <div><dt className="text-gray-500">Type</dt><dd className="text-gray-800">{asset.commodity_type ?? '—'}</dd></div>
            <div><dt className="text-gray-500">Brand</dt><dd className="text-gray-800">{asset.brand_name ?? '—'}</dd></div>
            <div><dt className="text-gray-500">Model</dt><dd className="text-gray-800">{asset.model_name ?? '—'}</dd></div>
            <div><dt className="text-gray-500">Serial Number</dt><dd className="text-gray-800">{asset.serial_number ?? '—'}</dd></div>
            <div><dt className="text-gray-500">Location</dt><dd className="text-gray-800">{asset.location ?? '—'}</dd></div>
            <div><dt className="text-gray-500">Status</dt><dd className="text-gray-800">{asset.status ?? '—'}</dd></div>
          </dl>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Assigned to</p>
            <p className="text-sm text-gray-800">
              {asset.assigned_users.length > 0 ? asset.assigned_users.map((u) => u.name).join(', ') : 'Unassigned'}
            </p>
          </div>
        </div>
      )}
    </Modal>
  );
}