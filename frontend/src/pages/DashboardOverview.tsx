import { useNavigate } from 'react-router-dom';
import KpiCards from '../components/KpiCards';
import AssetCharts from '../components/AssetCharts';
import RecentActivity from '../components/RecentActivity';
import { useQuery } from '@tanstack/react-query';
import { getAssets } from '../api/assets';

export default function DashboardOverview() {
  const navigate = useNavigate();
  const { data: assets } = useQuery({ queryKey: ['assets', {}], queryFn: () => getAssets() });

  function handleChartClick(field: 'commodity_type' | 'location', value: string) {
    navigate(`/assets?${field}=${encodeURIComponent(value)}`);
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>

      <KpiCards />

      {assets && <AssetCharts assets={assets} onSliceClick={handleChartClick} />}

      <RecentActivity />
    </div>
  );
}