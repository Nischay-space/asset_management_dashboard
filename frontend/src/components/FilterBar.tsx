import { useQuery } from '@tanstack/react-query';
import { getFilterOptions } from '../api/assets';
import type { AssetFilters } from '../api/assets';

interface FilterBarProps {
  filters: AssetFilters;
  onChange: (filters: AssetFilters) => void;
}

export default function FilterBar({ filters, onChange }: FilterBarProps) {
  const { data: options } = useQuery({
    queryKey: ['filter-options'],
    queryFn: getFilterOptions,
  });

  function updateFilter(key: keyof AssetFilters, value: string) {
    onChange({ ...filters, [key]: value || undefined });
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4 flex flex-wrap gap-4">
      <select
        value={filters.category ?? ''}
        onChange={(e) => updateFilter('category', e.target.value)}
        className="border border-gray-300 rounded px-3 py-2"
      >
        <option value="">All Categories</option>
        {options?.categories.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      <select
        value={filters.commodity_type ?? ''}
        onChange={(e) => updateFilter('commodity_type', e.target.value)}
        className="border border-gray-300 rounded px-3 py-2"
      >
        <option value="">All Types</option>
        {options?.commodity_types.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      <select
        value={filters.location ?? ''}
        onChange={(e) => updateFilter('location', e.target.value)}
        className="border border-gray-300 rounded px-3 py-2"
      >
        <option value="">All Locations</option>
        {options?.locations.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      <select
        value={filters.status ?? ''}
        onChange={(e) => updateFilter('status', e.target.value)}
        className="border border-gray-300 rounded px-3 py-2"
      >
        <option value="">All Statuses</option>
        {options?.statuses.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
    </div>
  );
}