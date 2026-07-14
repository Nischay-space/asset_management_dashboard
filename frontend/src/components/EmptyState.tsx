interface EmptyStateProps {
  message: string;
}

export default function EmptyState({ message }: EmptyStateProps) {
  return (
    <div className="text-center py-8 text-sm text-gray-400">
      {message}
    </div>
  );
}