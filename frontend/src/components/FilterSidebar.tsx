import { useQuery } from '@tanstack/react-query';
import { useState, useEffect, type ChangeEvent } from 'react';
import { getFilterOptions } from '../api/assets';
import type { AssetFilters } from '../api/assets';

interface FilterSidebarProps {
  view: 'users' | 'assets';
  onViewChange: (view: 'users' | 'assets') => void;
  filters: AssetFilters;
  onChange: (filters: AssetFilters) => void;
}

export default function FilterSidebar({ view, onViewChange, filters, onChange }: FilterSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { data: options } = useQuery({
    queryKey: ['filter-options'],
    queryFn: getFilterOptions,
    enabled: view === 'assets', 
  });

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

  function clearAll() {
    setSearchInput('');
    onChange({});
  }

  const activeCount = Object.values(filters).filter(Boolean).length;

  if (collapsed) {
    return (
      <div className="bg-white border-r border-gray-200 p-2 flex flex-col items-center">
        <button
          onClick={() => setCollapsed(false)}
          className="p-2 rounded hover:bg-gray-100"
          aria-label="Expand filters"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
        {activeCount > 0 && (
          <span className="mt-2 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {activeCount}
          </span>
        )}
      </div>
    );
  }

 return (
    <div className="bg-white border-r border-gray-200 p-4 w-64 overflow-y-auto shrink-0">
      <div className="flex justify-between items-center mb-4">
        <button onClick={() => setCollapsed(true)} className="p-1 rounded hover:bg-gray-100 ml-auto" aria-label="Collapse sidebar">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      <div className="inline-flex bg-gray-100 rounded-lg p-1 mb-5 w-full">
        {(['users', 'assets'] as const).map((option) => (
          <button
            key={option}
            onClick={() => onViewChange(option)}
            className={`flex-1 px-2 py-1.5 text-sm rounded-md capitalize ${
              view === option ? 'bg-white shadow text-gray-800' : 'text-gray-500'
            }`}
          >
            By {option === 'users' ? 'User' : 'Asset'}
          </button>
        ))}
      </div>

      <div className="flex justify-between items-center mb-3">
        <p className="text-sm font-semibold text-gray-700">
          {view === 'users' ? 'Search people' : 'Filters'}
        </p>
        {activeCount > 0 && (
          <button onClick={clearAll} className="text-xs text-blue-600 hover:underline">
            Clear all ({activeCount})
          </button>
        )}
      </div>

      <input
        type="text"
        placeholder={view === 'users' ? 'Search name or email...' : 'Search brand, model, serial...'}
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        className="w-full border border-gray-300 rounded px-3 py-2 mb-4 text-sm"
      />

      {view === 'assets' && (
        <>
          <label className="block text-xs text-gray-500 mb-1">Type</label>
          <select value={filters.commodity_type ?? ''} onChange={(e) => updateFilter('commodity_type', e.target.value)} className="w-full border border-gray-300 rounded px-2 py-2 mb-3 text-sm">
            <option value="">All types</option>
            {options?.commodity_types.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>

          <label className="block text-xs text-gray-500 mb-1">Location</label>
          <select value={filters.location ?? ''} onChange={(e) => updateFilter('location', e.target.value)} className="w-full border border-gray-300 rounded px-2 py-2 mb-3 text-sm">
            <option value="">All locations</option>
            {options?.locations.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>

          <label className="block text-xs text-gray-500 mb-1">Status</label>
          <select value={filters.status ?? ''} onChange={(e) => updateFilter('status', e.target.value)} className="w-full border border-gray-300 rounded px-2 py-2 text-sm">
            <option value="">All statuses</option>
            {options?.statuses.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </>
      )}
    </div>
  );
}