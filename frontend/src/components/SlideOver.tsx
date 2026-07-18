import { type ReactNode } from 'react';
import { X } from 'lucide-react';

interface SlideOverProps {
  onClose: () => void;
  children: ReactNode;
}

export default function SlideOver({ onClose, children }: SlideOverProps) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="fixed inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-surface w-full max-w-md h-full shadow-xl overflow-y-auto animate-slide-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
        {children}
      </div>
    </div>
  );
}