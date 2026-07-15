
interface StatusStyle {
  bg: string;
  text: string;
}

const STATUS_STYLES: Record<string, StatusStyle> = {
  active: { bg: 'bg-success-bg', text: 'text-success' },
  maintenance: { bg: 'bg-warning-bg', text: 'text-warning' },
  retired: { bg: 'bg-gray-100', text: 'text-gray-500' },
  lost: { bg: 'bg-danger-bg', text: 'text-danger' },
  inactive: { bg: 'bg-gray-100', text: 'text-gray-500' },
};

const DEFAULT_STYLE: StatusStyle = { bg: 'bg-gray-100', text: 'text-gray-600' };

export function getStatusStyle(status: string | null | undefined): StatusStyle {
  if (!status) return DEFAULT_STYLE;
  return STATUS_STYLES[status.toLowerCase()] ?? DEFAULT_STYLE;
}