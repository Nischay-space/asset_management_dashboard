import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Search } from 'lucide-react';
import Sidebar from './Sidebar';
import Breadcrumbs from './Breadcrumbs';
import CommandPalette from './CommandPalette';
import AssetDetailModal from './AssetDetailModal';
import QuickCreateMenu from './QuickCreateMenu';
import { useAuth } from '../context/AuthContext';

export default function DashboardLayout() {
  const { role } = useAuth();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [quickCreateAssetId, setQuickCreateAssetId] = useState<number | null>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setPaletteOpen(true);
      }
      if (e.key === 'Escape') setPaletteOpen(false);
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="flex h-screen bg-app-bg">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex items-center gap-4 px-6 py-3 border-b border-border-subtle bg-surface">
          <div className="shrink-0">
            <Breadcrumbs />
          </div>

          <div className="flex-1 flex justify-center">
            <button
              onClick={() => setPaletteOpen(true)}
              className="w-full max-w-sm flex items-center gap-2 text-left text-sm text-gray-400 border border-gray-200 rounded-lg px-3 py-1.5 hover:border-gray-300"
            >
              <Search className="w-4 h-4" />
              Search assets, users, and more...
              <kbd className="ml-auto text-xs border border-gray-200 rounded px-1.5">Ctrl K</kbd>
            </button>
          </div>

          <div className="shrink-0">
            {role === 'admin' && <QuickCreateMenu />}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </div>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} onSelectAsset={setQuickCreateAssetId} />
      {quickCreateAssetId && (
        <AssetDetailModal assetId={quickCreateAssetId} onClose={() => setQuickCreateAssetId(null)} />
      )}
    </div>
  );
}