import { useQuery } from '@tanstack/react-query';
import { getSummary } from '../api/assets';
import KpiCard from './KpiCard';

export default function KpiCards() {
  const { data: summary } = useQuery({
    queryKey: ['summary'],
    queryFn: getSummary,
  });

  if (!summary) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
      <KpiCard label="Total Assets" value={summary.total_assets} />
      <KpiCard label="Active" value={summary.active_assets} accent="success" />
      <KpiCard label="Inactive" value={summary.inactive_assets} accent="muted" />
      <KpiCard label="Locations" value={summary.total_locations} />
      <KpiCard label="People" value={summary.total_users} />
    </div>
  );
}