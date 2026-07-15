import Chip from './Chip';
import type { AssetFilters } from '../api/assets';

const FILTER_LABELS: Record<keyof AssetFilters, string> = {
  category: 'Category',
  commodity_type: 'Type',
  location: 'Location',
  status: 'Status',
  search: 'Search',
};

interface ActiveFilterChipsProps {
  filters: AssetFilters;
  onRemove: (key: keyof AssetFilters) => void;
  onClearAll: () => void;
}

export default function ActiveFilterChips({ filters, onRemove, onClearAll }: ActiveFilterChipsProps) {
  const activeEntries = (Object.entries(filters) as [keyof AssetFilters, string | undefined][]).filter(
    ([, value]) => Boolean(value)
  );

  if (activeEntries.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      {activeEntries.map(([key, value]) => (
        <button key={key} onClick={() => onRemove(key)} className="group">
          <Chip outlined>
            <span className="text-gray-500">{FILTER_LABELS[key]}:</span> {value}
            <span className="ml-1.5 text-gray-400 group-hover:text-gray-700">×</span>
          </Chip>
        </button>
      ))}
      <button onClick={onClearAll} className="text-xs text-primary hover:underline ml-1">
        Clear all
      </button>
    </div>
  );
}