import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { getUser } from '../api/users';
import Navbar from '../components/Navbar';
import AssetDetailModal from '../components/AssetDetailModal';

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedAssetId, setSelectedAssetId] = useState<number | null>(null);

  const { data: user, isLoading } = useQuery({
    queryKey: ['user', id],
    queryFn: () => getUser(Number(id)),
    enabled: !!id,
  });

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="p-6 max-w-3xl mx-auto">
        <button onClick={() => navigate(-1)} className="text-sm text-blue-600 hover:underline mb-4">
          ← Back
        </button>

        {isLoading && <p className="text-gray-500">Loading...</p>}
        {user && (
          <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-xl font-bold text-gray-800">{user.name}</h1>
            <p className="text-sm text-gray-500 mb-1">{user.email ?? 'No email on record'}</p>
            <span className="inline-block text-xs bg-gray-100 text-gray-600 rounded px-2 py-0.5 capitalize mb-4">
              {user.role}
            </span>

            <p className="text-sm font-medium text-gray-700 mb-2">{user.assigned_assets.length} assigned assets</p>
            <div className="divide-y divide-gray-100">
              {user.assigned_assets.map((asset) => (
                <button
                  key={asset.id}
                  onClick={() => setSelectedAssetId(asset.id)}
                  className="w-full text-left py-3 flex justify-between items-center hover:bg-gray-50"
                >
                  <span className="text-sm text-gray-800">{asset.name} <span className="text-gray-400">· {asset.asset_code}</span></span>
                  <span className={`text-xs px-2 py-0.5 rounded ${asset.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {asset.is_active ? 'Active' : 'Inactive'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      {selectedAssetId && (
        <AssetDetailModal assetId={selectedAssetId} onClose={() => setSelectedAssetId(null)} />
      )}
    </div>
  );
}