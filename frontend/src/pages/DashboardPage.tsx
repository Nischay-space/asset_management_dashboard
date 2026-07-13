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
          {view === 'users' && filteredUsers && (
            <>
              <p className="text-gray-700 mb-3">{filteredUsers.length} people found</p>
              <UserTable users={filteredUsers} onAssetClick={setSelectedAssetId} />
            </>
          )}

          {view === 'assets' && (
            <>
              {isLoading && <p className="text-gray-600">Loading assets...</p>}
              {isError && <p className="text-red-600">Failed to load assets.</p>}
              {assets && (
                <>
                  <p className="text-gray-700 mb-3">{assets.length} assets found</p>
                  <AssetTable assets={assets} onRowClick={setSelectedAssetId} />
                </>
              )}
            </>
          )}
        </main>
      </div>

      {selectedAssetId && (
        <AssetDetailModal assetId={selectedAssetId} onClose={() => setSelectedAssetId(null)} />
      )}
    </div>
  );
}