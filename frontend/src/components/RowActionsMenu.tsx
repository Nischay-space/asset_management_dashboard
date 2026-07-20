import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { MoreVertical, Pencil, Trash2 } from 'lucide-react';

interface RowActionsMenuProps {
  onEdit: () => void;
  onDelete: () => void;
}

export default function RowActionsMenu({ onEdit, onDelete }: RowActionsMenuProps) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          onClick={(e) => e.stopPropagation()}
          className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700"
          aria-label="Row actions"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={4}
          className="w-36 bg-surface rounded-lg shadow-lg border border-border-subtle py-1 z-20"
        >
          <DropdownMenu.Item
            onSelect={onEdit}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 outline-none cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5" /> Edit
          </DropdownMenu.Item>
          <DropdownMenu.Item
            onSelect={onDelete}
            className="flex items-center gap-2 px-3 py-2 text-sm text-danger hover:bg-red-50 outline-none cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}