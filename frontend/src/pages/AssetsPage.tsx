import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { getAssets, deleteAsset } from '../api/assets';
import type { AssetFilters } from '../api/assets';
import type { Asset } from '../types/asset';
import { useAuth } from '../context/AuthContext';
import { exportAssetsToCsv } from '../utils/export';
import AssetTable from '../components/AssetTable';
import AssetCharts from '../components/AssetCharts';
import ActiveFilterChips from '../components/ActiveFilterChips';
import AssetFilterPanel from '../components/AssetFilterPanel';
import AssetDetailModal from '../components/AssetDetailModal';
import AssetFormModal from '../components/AssetFormModal';
import ConfirmDialog from '../components/ConfirmDialog';
import TableSkeleton from '../components/TableSkeleton';
import EmptyState from '../components/EmptyState';

export default function AssetsPage() {
  const { role } = useAuth();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  const [selectedAssetId, setSelectedAssetId] = useState<number | null>(null);
  const [formAsset, setFormAsset] = useState<Asset | 'new' | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Asset | null>(null);

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

  function handleRemoveFilter(key: keyof AssetFilters) {
    const updated = { ...filters };
    delete updated[key];
    handleFilterChange(updated);
  }

  function handleChartClick(field: 'commodity_type' | 'location', value: string) {
    handleFilterChange({ ...filters, [field]: value });
  }

  const { data: assets, isLoading, isError } = useQuery({
    queryKey: ['assets', filters],
    queryFn: () => getAssets(filters),
  });

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

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold text-gray-800">Assets</h1>
        <div className="flex gap-2">
          {role === 'admin' && (
            <button
              onClick={() => setFormAsset('new')}
              className="text-sm bg-primary text-white rounded-lg px-3 py-1.5 hover:bg-primary-hover flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Asset
            </button>
          )}
          {assets && (
            <button onClick={() => exportAssetsToCsv(assets)} className="text-sm bg-white border border-gray-300 rounded-lg px-3 py-1.5 hover:bg-gray-50">
              Export CSV
            </button>
          )}
        </div>
      </div>

      <AssetFilterPanel filters={filters} onChange={handleFilterChange} />

      {isLoading && <TableSkeleton />}
      {isError && <p className="text-danger">Failed to load assets.</p>}

      {assets && (
        <>
          <AssetCharts assets={assets} onSliceClick={handleChartClick} />
          <ActiveFilterChips filters={filters} onRemove={handleRemoveFilter} onClearAll={() => handleFilterChange({})} />
          <p className="text-gray-700 mb-3">{assets.length} assets found</p>

          {assets.length === 0 ? (
            <EmptyState message="No assets match these filters." />
          ) : (
            <AssetTable assets={assets} onRowClick={setSelectedAssetId} onEdit={setFormAsset} onDelete={setDeleteTarget} />
          )}
        </>
      )}

      {selectedAssetId && (
        <AssetDetailModal assetId={selectedAssetId} onClose={() => setSelectedAssetId(null)} />
      )}

      {formAsset && (
        <AssetFormModal asset={formAsset === 'new' ? undefined : formAsset} onClose={() => setFormAsset(null)} />
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
    </div>
  );
}