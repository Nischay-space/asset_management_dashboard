import type { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  accent?: 'primary' | 'success' | 'warning' | 'muted';
}

const ACCENT_STYLES = {
  primary: { border: 'border-l-primary', iconBg: 'bg-blue-50', iconColor: 'text-primary' },
  success: { border: 'border-l-success', iconBg: 'bg-success-bg', iconColor: 'text-success' },
  warning: { border: 'border-l-warning', iconBg: 'bg-warning-bg', iconColor: 'text-warning' },
  muted: { border: 'border-l-gray-300', iconBg: 'bg-gray-100', iconColor: 'text-gray-400' },
};

export default function KpiCard({ label, value, icon: Icon, accent = 'primary' }: KpiCardProps) {
  const style = ACCENT_STYLES[accent];

  return (
    <div className={`bg-white rounded-lg shadow-sm p-4 border-l-4 ${style.border} hover:shadow-md hover:-translate-y-0.5 transition-all duration-150`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-gray-500">{label}</p>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${style.iconBg}`}>
          <Icon className={`w-4 h-4 ${style.iconColor}`} />
        </div>
      </div>
      <p className="text-2xl font-semibold text-gray-800">{value}</p>
    </div>
  );
}