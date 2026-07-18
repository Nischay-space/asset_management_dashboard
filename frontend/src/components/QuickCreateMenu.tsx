import { useState, useRef, useEffect } from 'react';
import { Plus, Package, UserPlus } from 'lucide-react';
import AssetFormModal from './AssetFormModal';
import UserFormModal from './UserFormModal';

export default function QuickCreateMenu() {
  const [open, setOpen] = useState(false);
  const [showAssetForm, setShowAssetForm] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 bg-primary text-white text-sm px-3 py-1.5 rounded-lg hover:bg-primary-hover"
      >
        <Plus className="w-4 h-4" /> Quick Create
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-44 bg-surface rounded-lg shadow-lg border border-border-subtle py-1 z-20">
          <button
            onClick={() => { setOpen(false); setShowAssetForm(true); }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            <Package className="w-4 h-4" /> New Asset
          </button>
          <button
            onClick={() => { setOpen(false); setShowUserForm(true); }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            <UserPlus className="w-4 h-4" /> New Person
          </button>
        </div>
      )}

      {showAssetForm && <AssetFormModal onClose={() => setShowAssetForm(false)} />}
      {showUserForm && <UserFormModal onClose={() => setShowUserForm(false)} />}
    </div>
  );
}   