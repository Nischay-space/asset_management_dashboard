import Chip from './Chip';
import { getStatusStyle } from '../utils/statusStyles';

interface StatusBadgeProps {
  status?: string | null;
  isActive?: boolean;
}

export default function StatusBadge({ status, isActive }: StatusBadgeProps) {
  const effectiveStatus = status ?? (isActive !== undefined ? (isActive ? 'Active' : 'Inactive') : null);
  const style = getStatusStyle(effectiveStatus);

  return (
    <Chip bg={style.bg} text={style.text}>
      {effectiveStatus ?? 'Unknown'}
    </Chip>
  );
}