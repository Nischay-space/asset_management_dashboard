interface StatusBadgeProps {
  isActive: boolean;
}

export default function StatusBadge({ isActive }: StatusBadgeProps) {
  return (
    <span className={`text-xs px-2 py-1 rounded ${isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
      {isActive ? 'Active' : 'Inactive'}
    </span>
  );
}