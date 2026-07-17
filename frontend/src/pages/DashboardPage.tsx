import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getAssets } from '../api/assets';
import type { AssetFilters } from '../api/assets';
import AssetTable from '../components/AssetTable';
import FilterSidebar from '../components/FilterSidebar';
import Navbar from '../components/Navbar';
import AssetDetailModal from '../components/AssetDetailModal';
import UserTable from '../components/UserTable';
import { getUsers } from '../api/users';
import AssetCharts from '../components/AssetCharts';
import TableSkeleton from '../components/TableSkeleton';
import UserCharts from '../components/UserCharts';
import { exportAssetsToCsv, exportUsersToCsv } from '../utils/export';
import KpiCards from '../components/KpiCards';
import ActiveFilterChips from '../components/ActiveFilterChips';
import Footer from '../components/Footer';
import AssetFormModal from '../components/AssetFormModal';
import ConfirmDialog from '../components/ConfirmDialog';
import { deleteAsset } from '../api/assets';
import type { Asset } from '../types/asset';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import UserFormModal from '../components/UserFormModal';
import { deleteUser } from '../api/users';
import type { UserWithAssets } from '../types/asset';

export default function DashboardPage() {
  const [view, setView] = useState<'users' | 'assets'>('users');
  const [selectedAssetId, setSelectedAssetId] = useState<number | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const { role } = useAuth();
  const queryClient = useQueryClient();
  const [formAsset, setFormAsset] = useState<Asset | 'new' | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Asset | null>(null);
  const [formUser, setFormUser] = useState<UserWithAssets | 'new' | null>(null);
  const [deleteUserTarget, setDeleteUserTarget] = useState<UserWithAssets | null>(null);

  const filters: AssetFilters = {
    category: searchParams.get('category') ?? undefined,
    commodity_type: searchParams.get('commodity_type') ?? undefined,
    location: searchParams.get('location') ?? undefined,
    status: searchParams.get('status') ?? undefined,
    search: searchParams.get('search') ?? undefined,
  };

  function handleFilterChange(newFilters: AssetFilters) {
    const params: Record<string, string> = {};
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) params[key] = value;
    });
    setSearchParams(params);
  }
  function handleChartClick(field: 'commodity_type' | 'location', value: string) {
    handleFilterChange({ ...filters, [field]: value });
  }
  function handleRemoveFilter(key: keyof AssetFilters) {
    const updated = { ...filters };
    delete updated[key];
    handleFilterChange(updated);
  }

  function handleClearAllFilters() {
    handleFilterChange({});
  }
  // Function to handle asset deletion
  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    try {
      await deleteAsset(deleteTarget.id);
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      toast.success('Asset deleted');
    } catch {
      toast.error('Failed to delete asset');
    } finally {
      setDeleteTarget(null);
    }
  }

  async function handleConfirmDeleteUser() {
    if (!deleteUserTarget) return;
    try {
      await deleteUser(deleteUserTarget.id);
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      toast.success('User deleted');
    } catch {
      toast.error('Failed to delete user');
    } finally {
      setDeleteUserTarget(null);
    }
  }

  const { data: users } = useQuery({ queryKey: ['users'], queryFn: getUsers, enabled: view === 'users' });
  const { data: assets, isLoading, isError } = useQuery({
    queryKey: ['assets', filters],
    queryFn: () => getAssets(filters),
    enabled: view === 'assets',
  });

  const filteredUsers = users?.filter((u) => {
    if (!filters.search) return true;
    const term = filters.search.toLowerCase();
    return u.name.toLowerCase().includes(term) || (u.email ?? '').toLowerCase().includes(term);
  });

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <Navbar />
      <div className="flex flex-1 min-h-0">
        <FilterSidebar view={view} onViewChange={setView} filters={filters} onChange={handleFilterChange} />

        <main className="flex-1 min-w-0 overflow-auto p-6">
          <KpiCards />
          {view === 'users' && !filteredUsers && <TableSkeleton columns={5} />}
          {view === 'users' && filteredUsers && (
            <>
              <UserCharts users={filteredUsers} />
              <div className="flex justify-between items-center mb-3">
                <p className="text-gray-700">{filteredUsers.length} people found</p>
                <div className="flex gap-2">
                  {role === 'admin' && (
                    <button
                      onClick={() => setFormUser('new')}
                      className="text-sm bg-primary text-white rounded-lg px-3 py-1.5 hover:bg-primary-hover flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Person
                    </button>
                  )}
                  <button onClick={() => exportUsersToCsv(filteredUsers)} className="text-sm bg-white border border-gray-300 rounded-lg px-3 py-1.5 hover:bg-gray-50">
                    Export CSV
                  </button>
                </div>
              </div>
              <UserTable users={filteredUsers} onAssetClick={setSelectedAssetId} onEdit={setFormUser} onDelete={setDeleteUserTarget} />
            </>
          )}
          {view === 'assets' && (
            <>
              {isLoading && <TableSkeleton />}
              {isError && <p className="text-red-600">Failed to load assets.</p>}
              {assets && (
                <>
                  <AssetCharts assets={assets} onSliceClick={handleChartClick} />
                  <ActiveFilterChips filters={filters} onRemove={handleRemoveFilter} onClearAll={handleClearAllFilters} />
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-gray-700">{assets.length} assets found</p>
                    <div className="flex gap-2">
                      {role === 'admin' && (
                        <button
                          onClick={() => setFormAsset('new')}
                          className="text-sm bg-primary text-white rounded-lg px-3 py-1.5 hover:bg-primary-hover flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add Asset
                        </button>
                      )}
                      <button onClick={() => exportAssetsToCsv(assets)} className="text-sm bg-white border border-gray-300 rounded-lg px-3 py-1.5 hover:bg-gray-50">
                        Export CSV
                      </button>
                    </div>
                  </div>
                  <AssetTable
                    assets={assets}
                    onRowClick={setSelectedAssetId}
                    onEdit={setFormAsset}
                    onDelete={setDeleteTarget}
                  />
                </>
              )}
            </>
          )}
          <Footer />
        </main>
      </div>

      {<>

        {selectedAssetId && (
          <AssetDetailModal assetId={selectedAssetId} onClose={() => setSelectedAssetId(null)} />
        )
        }
        {formAsset && (
          <AssetFormModal
            asset={formAsset === 'new' ? undefined : formAsset}
            onClose={() => setFormAsset(null)}
          />
        )}

        {deleteTarget && (
          <ConfirmDialog
            title="Delete this asset?"
            message={`This will permanently delete ${deleteTarget.name} and any attached invoices. This cannot be undone.`}
            confirmLabel="Delete"
            isDangerous
            onConfirm={handleConfirmDelete}
            onCancel={() => setDeleteTarget(null)}
          />
        )}
        {formUser && (
          <UserFormModal user={formUser === 'new' ? undefined : formUser} onClose={() => setFormUser(null)} />
        )}
        {deleteUserTarget && (
          <ConfirmDialog
            title="Delete this person?"
            message={`This will remove ${deleteUserTarget.name} and unassign their devices. Devices will not be deleted.`}
            confirmLabel="Delete"
            isDangerous
            onConfirm={handleConfirmDeleteUser}
            onCancel={() => setDeleteUserTarget(null)}
          />
        )}

      </>
      }
    </div >
  );
}