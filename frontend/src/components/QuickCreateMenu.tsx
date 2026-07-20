import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useState } from 'react';
import { Plus, Package, UserPlus } from 'lucide-react';
import AssetFormModal from './AssetFormModal';
import UserFormModal from './UserFormModal';

export default function QuickCreateMenu() {
  const [showAssetForm, setShowAssetForm] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);

  return (
    <>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button className="flex items-center gap-1.5 bg-primary text-white text-sm px-3 py-1.5 rounded-lg hover:bg-primary-hover">
            <Plus className="w-4 h-4" /> Quick Create
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content align="end" sideOffset={4} className="w-44 bg-surface rounded-lg shadow-lg border border-border-subtle py-1 z-20">
            <DropdownMenu.Item onSelect={() => setShowAssetForm(true)} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 outline-none cursor-pointer">
              <Package className="w-4 h-4" /> New Asset
            </DropdownMenu.Item>
            <DropdownMenu.Item onSelect={() => setShowUserForm(true)} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 outline-none cursor-pointer">
              <UserPlus className="w-4 h-4" /> New Person
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      {showAssetForm && <AssetFormModal onClose={() => setShowAssetForm(false)} />}
      {showUserForm && <UserFormModal onClose={() => setShowUserForm(false)} />}
    </>
  );
}