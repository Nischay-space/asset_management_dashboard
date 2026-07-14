import Papa from 'papaparse';
import type { Asset, UserWithAssets } from '../types/asset';

function downloadCsv(rows: Record<string, string | number>[], filename: string) {
  const csv = Papa.unparse(rows);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function exportAssetsToCsv(assets: Asset[], filename = 'assets.csv') {
  const rows = assets.map((a) => ({
    asset_code: a.asset_code,
    name: a.name,
    category: a.category ?? '',
    commodity_type: a.commodity_type ?? '',
    brand_name: a.brand_name ?? '',
    model_name: a.model_name ?? '',
    serial_number: a.serial_number ?? '',
    location: a.location ?? '',
    status: a.status ?? '',
    is_active: a.is_active ? 'Yes' : 'No',
    assigned_to: a.assigned_users.map((u) => u.name).join('; '),
  }));
  downloadCsv(rows, filename);
}

export function exportUsersToCsv(users: UserWithAssets[], filename = 'users.csv') {
  const rows = users.map((u) => ({
    name: u.name,
    email: u.email ?? '',
    role: u.role,
    asset_count: u.assigned_assets.length,
    assets: u.assigned_assets.map((a) => `${a.commodity_type ?? a.name} (${a.asset_code})`).join('; '),
  }));
  downloadCsv(rows, filename);
}