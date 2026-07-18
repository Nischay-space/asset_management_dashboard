
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { getRecentAssets } from '../api/assets';
import { getDuplicateCandidates } from '../api/duplicates';
import EmptyState from './EmptyState';

function timeAgo(dateString: string): string {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours < 1) return 'just now';
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}

export default function RecentActivity() {
  const navigate = useNavigate();
  const { data: recentAssets } = useQuery({ queryKey: ['recent-assets'], queryFn: getRecentAssets });
  const { data: duplicates } = useQuery({ queryKey: ['duplicates'], queryFn: getDuplicateCandidates });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-white rounded-lg shadow-sm p-4">
        <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-400" /> Recently Added
        </p>
        {recentAssets && recentAssets.length === 0 && <EmptyState message="No assets added yet." />}
        <ul className="divide-y divide-gray-50">
          {recentAssets?.map((a) => (
            <li key={a.id}>
              <button
                onClick={() => navigate(`/assets?search=${encodeURIComponent(a.asset_code)}`)}
                className="w-full flex justify-between items-center py-2 text-sm hover:text-primary"
              >
                <span className="text-gray-700">{a.name}</span>
                <span className="text-xs text-gray-400">{timeAgo(a.created_at)}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4">
        <p className="text-sm font-semibold text-gray-700 mb-3">Pending Reviews</p>
        {duplicates && duplicates.length === 0 ? (
          <EmptyState message="No duplicate reviews pending." />
        ) : (
          <button
            onClick={() => navigate('/duplicates')}
            className="w-full flex justify-between items-center py-2 text-sm hover:text-primary"
          >
            <span className="text-gray-700">{duplicates?.length ?? 0} possible duplicate {duplicates?.length === 1 ? 'pair' : 'pairs'}</span>
            <span className="text-xs text-primary">Review →</span>
          </button>
        )}
      </div>
    </div>
  );
}