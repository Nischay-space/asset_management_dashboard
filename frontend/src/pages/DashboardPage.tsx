import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
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

export default function DashboardPage() {
  const [view, setView] = useState<'users' | 'assets'>('users');
  const [selectedAssetId, setSelectedAssetId] = useState<number | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();

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
          {view === 'users' && !filteredUsers && <TableSkeleton columns={5} />}
          {view === 'users' && filteredUsers && (
            <>
              <UserCharts users={filteredUsers} />
              <div className="flex justify-between items-center mb-3">
                <p className="text-gray-700">{filteredUsers.length} people found</p>
                <button
                  onClick={() => exportUsersToCsv(filteredUsers)}
                  className="text-sm bg-white border border-gray-300 rounded px-3 py-1.5 hover:bg-gray-50"
                >
                  Export CSV
                </button>
              </div>
              <UserTable users={filteredUsers} onAssetClick={setSelectedAssetId} />
            </>
          )}
          {view === 'assets' && (
            <>
              {isLoading && <TableSkeleton />}
              {isError && <p className="text-red-600">Failed to load assets.</p>}
              {assets && (
                <>
                  <AssetCharts assets={assets} onSliceClick={handleChartClick} />
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-gray-700">{assets.length} assets found</p>
                    <button
                      onClick={() => exportAssetsToCsv(assets)}
                      className="text-sm bg-white border border-gray-300 rounded px-3 py-1.5 hover:bg-gray-50"
                    >
                      Export CSV
                    </button>
                  </div>
                  <AssetTable assets={assets} onRowClick={setSelectedAssetId} />
                </>
              )}
            </>
          )}
        </main>
      </div>

      {
        selectedAssetId && (
          <AssetDetailModal assetId={selectedAssetId} onClose={() => setSelectedAssetId(null)} />
        )
      }
    </div >
  );
}