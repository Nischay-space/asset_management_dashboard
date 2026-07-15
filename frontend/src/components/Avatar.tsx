interface AvatarProps {
  name: string;
  size?: 'sm' | 'md';
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}

export default function Avatar({ name, size = 'md' }: AvatarProps) {
  const sizeClasses = size === 'sm' ? 'w-7 h-7 text-xs' : 'w-9 h-9 text-sm';

  return (
    <div className={`${sizeClasses} rounded-full bg-primary text-white flex items-center justify-center font-medium shrink-0`}>
      {getInitials(name)}
    </div>
  );
}