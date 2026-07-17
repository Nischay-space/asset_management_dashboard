import { useState, useRef, useEffect } from 'react';
import { MoreVertical, Pencil, Trash2 } from 'lucide-react';

interface RowActionsMenuProps {
  onEdit: () => void;
  onDelete: () => void;
}

export default function RowActionsMenu({ onEdit, onDelete }: RowActionsMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700"
        aria-label="Row actions"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-36 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-20">
          <button
            onClick={(e) => { e.stopPropagation(); setOpen(false); onEdit(); }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            <Pencil className="w-3.5 h-3.5" /> Edit
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setOpen(false); onDelete(); }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-danger hover:bg-red-50"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
        </div>
      )}
    </div>
  );
}