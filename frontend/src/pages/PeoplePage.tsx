import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getUsers, deleteUser } from '../api/users';
import type { UserWithAssets } from '../types/asset';
import { exportUsersToCsv } from '../utils/export';
import UserTable from '../components/UserTable';
import UserCharts from '../components/UserCharts';
import UserFormModal from '../components/UserFormModal';
import AssetDetailModal from '../components/AssetDetailModal';
import ConfirmDialog from '../components/ConfirmDialog';
import TableSkeleton from '../components/TableSkeleton';
import EmptyState from '../components/EmptyState';

export default function PeoplePage() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [selectedAssetId, setSelectedAssetId] = useState<number | null>(null);
  const [formUser, setFormUser] = useState<UserWithAssets | 'new' | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserWithAssets | null>(null);

  const { data: users, isLoading } = useQuery({ queryKey: ['users'], queryFn: getUsers });

  const filteredUsers = users?.filter((u) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return u.name.toLowerCase().includes(term) || (u.email ?? '').toLowerCase().includes(term);
  });

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    try {
      await deleteUser(deleteTarget.id);
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      toast.success('User deleted');
    } catch {
      toast.error('Failed to delete user');
    } finally {
      setDeleteTarget(null);
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold text-gray-800">Users</h1>
        
          {filteredUsers && (
            <button onClick={() => exportUsersToCsv(filteredUsers)} className="text-sm bg-white border border-gray-300 rounded-lg px-3 py-1.5 hover:bg-gray-50">
              Export CSV
            </button>
          )}
        
      </div>

      <input
        type="text"
        placeholder="Search name or email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-sm border border-gray-300 rounded-lg px-3 py-2 text-sm mb-4"
      />

      {isLoading && <TableSkeleton columns={5} />}

      {filteredUsers && (
        <>
          <UserCharts users={filteredUsers} />
          <p className="text-gray-700 mb-3">{filteredUsers.length} people found</p>

          {filteredUsers.length === 0 ? (
            <EmptyState message="No people match this search." />
          ) : (
            <UserTable users={filteredUsers} onAssetClick={setSelectedAssetId} onEdit={setFormUser} onDelete={setDeleteTarget} />
          )}
        </>
      )}

      {selectedAssetId && (
        <AssetDetailModal assetId={selectedAssetId} onClose={() => setSelectedAssetId(null)} />
      )}

      {formUser && (
        <UserFormModal user={formUser === 'new' ? undefined : formUser} onClose={() => setFormUser(null)} />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete this person?"
          message={`This will remove ${deleteTarget.name} and unassign their devices. Devices will not be deleted.`}
          confirmLabel="Delete"
          isDangerous
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}