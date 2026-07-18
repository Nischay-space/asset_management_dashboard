import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getFilterOptions } from '../api/assets';
import type { AssetFilters } from '../api/assets';

interface AssetFilterPanelProps {
  filters: AssetFilters;
  onChange: (filters: AssetFilters) => void;
}

export default function AssetFilterPanel({ filters, onChange }: AssetFilterPanelProps) {
  const { data: options } = useQuery({ queryKey: ['filter-options'], queryFn: getFilterOptions });
  const [searchInput, setSearchInput] = useState(filters.search ?? '');

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange({ ...filters, search: searchInput || undefined });
    }, 400);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  function updateFilter(key: keyof AssetFilters, value: string) {
    onChange({ ...filters, [key]: value || undefined });
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-4 flex flex-wrap items-end gap-3">
      <div className="flex-1 min-w-[180px]">
        <label className="block text-xs text-gray-500 mb-1">Search</label>
        <input
          type="text"
          placeholder="Brand, model, serial, code..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
        />
      </div>

      <div className="min-w-[140px]">
        <label className="block text-xs text-gray-500 mb-1">Type</label>
        <select value={filters.commodity_type ?? ''} onChange={(e) => updateFilter('commodity_type', e.target.value)} className="w-full border border-gray-300 rounded-lg px-2 py-2 text-sm">
          <option value="">All types</option>
          {options?.commodity_types.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="min-w-[140px]">
        <label className="block text-xs text-gray-500 mb-1">Location</label>
        <select value={filters.location ?? ''} onChange={(e) => updateFilter('location', e.target.value)} className="w-full border border-gray-300 rounded-lg px-2 py-2 text-sm">
          <option value="">All locations</option>
          {options?.locations.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="min-w-[140px]">
        <label className="block text-xs text-gray-500 mb-1">Status</label>
        <select value={filters.status ?? ''} onChange={(e) => updateFilter('status', e.target.value)} className="w-full border border-gray-300 rounded-lg px-2 py-2 text-sm">
          <option value="">All statuses</option>
          {options?.statuses.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
    </div>
  );
}