import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { countRelated } from '../utils/aggregate';
import type { UserWithAssets } from '../types/asset';

interface UserChartsProps {
  users: UserWithAssets[];
}

export default function UserCharts({ users }: UserChartsProps) {
  const topHolders = countRelated(
    users,
    (u) => u.name,
    (u) => u.assigned_assets.length
  ).slice(0, 10);

  if (topHolders.length === 0) return null;

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      <p className="text-sm font-semibold text-gray-700 mb-2">Top 10 by assets held</p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={topHolders} layout="vertical" margin={{ left: 40 }}>
          <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={100} />
          <Tooltip />
          <Bar dataKey="count" fill="#4F46E5" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}