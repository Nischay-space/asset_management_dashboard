import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { getUser } from '../api/users';
import Navbar from '../components/Navbar';
import AssetDetailModal from '../components/AssetDetailModal';
import StatusBadge from '../components/StatusBadge';
import { deleteUser } from '../api/users';
import ConfirmDialog from '../components/ConfirmDialog';
import { Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';


export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedAssetId, setSelectedAssetId] = useState<number | null>(null);
  const { role } = useAuth();
  const queryClient = useQueryClient();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { data: user, isLoading } = useQuery({
    queryKey: ['user', id],
    queryFn: () => getUser(Number(id)),
    enabled: !!id,
  });
  async function handleDeleteUser() {
    try {
      await deleteUser(Number(id));
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      toast.success('User deleted');
      navigate('/');
    } catch {
      toast.error('Failed to delete user');
    }
  }

  return (
    <>

      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="p-6 max-w-3xl mx-auto">
          <button onClick={() => navigate(-1)} className="text-sm text-blue-600 hover:underline mb-4">
            ← Back
          </button>

          {isLoading && <p className="text-gray-500">Loading...</p>}
          {user && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-xl font-bold text-gray-800">{user.name}</h1>
                  <p className="text-sm text-gray-500 mb-1">{user.email ?? 'No email on record'}</p>
                  <span className="inline-block text-xs bg-gray-100 text-gray-600 rounded px-2 py-0.5 capitalize mb-4">
                    {user.role}
                  </span>
                </div>
                {role === 'admin' && (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="text-gray-400 hover:text-danger p-1"
                    aria-label="Delete user"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <p className="text-sm font-medium text-gray-700 mb-2">{user.assigned_assets.length} assigned assets</p>
              <div className="divide-y divide-gray-100">
                {user.assigned_assets.map((asset) => (
                  <button
                    key={asset.id}
                    onClick={() => setSelectedAssetId(asset.id)}
                    className="w-full text-left py-3 flex justify-between items-center hover:bg-gray-50"
                  >
                    <span className="text-sm text-gray-800">{asset.name} <span className="text-gray-400">· {asset.asset_code}</span></span>
                    <StatusBadge isActive={asset.is_active} />
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
      {showDeleteConfirm && (
        <ConfirmDialog
          title="Delete this user?"
          message={`This will permanently remove ${user?.name ?? 'this person'} and unassign all their devices. The devices themselves will not be deleted.`}
          confirmLabel="Delete"
          isDangerous
          onConfirm={handleDeleteUser}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </>
  );
}