interface KpiCardProps {
  label: string;
  value: number;
  accent?: 'default' | 'success' | 'muted';
}

export default function KpiCard({ label, value, accent = 'default' }: KpiCardProps) {
  const accentClass = {
    default: 'text-gray-800',
    success: 'text-green-600',
    muted: 'text-gray-400',
  }[accent];

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-2xl font-semibold ${accentClass}`}>{value}</p>
    </div>
  );
}