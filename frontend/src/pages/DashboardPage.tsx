import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { getAssets } from '../api/assets';
import AssetTable from '../components/AssetTable';

export default function DashboardPage() {
  const { logout } = useAuth();

  const { data: assets, isLoading, isError } = useQuery({
    queryKey: ['assets'],
    queryFn: () => getAssets(),
  });

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Asset Dashboard</h1>
        <button
          onClick={logout}
          className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800"
        >
          Logout
        </button>
      </div>

      {isLoading && <p className="text-gray-600">Loading assets...</p>}
      {isError && <p className="text-red-600">Failed to load assets.</p>}

      {assets && (
        <>
          <p className="text-gray-700 mb-3">{assets.length} assets found</p>
          <AssetTable assets={assets} />
        </>
      )}
    </div>
  );
}