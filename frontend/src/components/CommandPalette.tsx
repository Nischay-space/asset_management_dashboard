
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, Package, User as UserIcon } from 'lucide-react';
import { globalSearch } from '../api/search';

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  onSelectAsset: (id: number) => void;
}

export default function CommandPalette({ open, onClose, onSelectAsset }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedQuery(query), 250);
    return () => clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setDebouncedQuery('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const { data: results } = useQuery({
    queryKey: ['global-search', debouncedQuery],
    queryFn: () => globalSearch(debouncedQuery),
    enabled: debouncedQuery.length > 0,
  });

  function goToAsset(id: number) {
    onSelectAsset(id);
    onClose();
  }

  function goToUser(id: number) {
    navigate(`/users/${id}`);
    onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center pt-24" onClick={onClose}>
      <div
        className="bg-surface rounded-xl shadow-lg w-full max-w-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border-subtle">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search assets, users, and more..."
            className="flex-1 outline-none text-sm"
          />
          <kbd className="text-xs text-gray-400 border border-gray-200 rounded px-1.5 py-0.5">Esc</kbd>
        </div>

        {debouncedQuery.length === 0 && (
          <p className="text-sm text-gray-400 px-4 py-6 text-center">Start typing to search...</p>
        )}

        {results && results.assets.length === 0 && results.users.length === 0 && (
          <p className="text-sm text-gray-400 px-4 py-6 text-center">No results found.</p>
        )}

        {results && results.assets.length > 0 && (
          <div className="py-2">
            <p className="text-xs text-gray-400 px-4 py-1 uppercase tracking-wide">Assets</p>
            {results.assets.map((a) => (
              <button
                key={a.id}
                onClick={() => goToAsset(a.id)}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 text-left"
              >
                <Package className="w-4 h-4 text-gray-400" />
                <span className="text-gray-800">{a.name}</span>
                <span className="text-xs text-gray-400 ml-auto">{a.asset_code}</span>
              </button>
            ))}
          </div>
        )}

        {results && results.users.length > 0 && (
          <div className="py-2 border-t border-border-subtle">
            <p className="text-xs text-gray-400 px-4 py-1 uppercase tracking-wide">People</p>
            {results.users.map((u) => (
              <button
                key={u.id}
                onClick={() => goToUser(u.id)}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 text-left"
              >
                <UserIcon className="w-4 h-4 text-gray-400" />
                <span className="text-gray-800">{u.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}