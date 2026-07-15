import { useQuery } from '@tanstack/react-query';
import { Package, CheckCircle2, XCircle, MapPin, Users, Sparkles } from 'lucide-react';
import { getSummary } from '../api/assets';
import KpiCard from './KpiCard';

export default function KpiCards() {
  const { data: summary } = useQuery({
    queryKey: ['summary'],
    queryFn: getSummary,
  });

  if (!summary) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
      <KpiCard label="Total Assets" value={summary.total_assets} icon={Package} accent="primary" />
      <KpiCard label="Active" value={summary.active_assets} icon={CheckCircle2} accent="success" />
      <KpiCard label="Inactive" value={summary.inactive_assets} icon={XCircle} accent="muted" />
      <KpiCard label="Locations" value={summary.total_locations} icon={MapPin} accent="primary" />
      <KpiCard label="People" value={summary.total_users} icon={Users} accent="primary" />
      <KpiCard label="Added (7d)" value={summary.recently_added} icon={Sparkles} accent="warning" />
    </div>
  );
}