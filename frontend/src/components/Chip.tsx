import { type ReactNode } from 'react';

interface ChipProps {
  children: ReactNode;
  bg?: string;
  text?: string;
  outlined?: boolean;
}

export default function Chip({ children, bg = 'bg-gray-100', text = 'text-gray-600', outlined = false }: ChipProps) {
  const outlineClass = outlined ? 'border border-gray-300 bg-white' : bg;

  return (
    <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full ${outlineClass} ${text}`}>
      {children}
    </span>
  );
}