import {
  useReactTable,
  getCoreRowModel,
  createColumnHelper,
  flexRender,
} from '@tanstack/react-table';
import type { Asset } from '../types/asset';

const columnHelper = createColumnHelper<Asset>();

const columns = [
  columnHelper.accessor('asset_code', {
    header: 'Asset Code',
  }),
  columnHelper.accessor('name', {
    header: 'Name',
  }),
  columnHelper.accessor('category', {
    header: 'Category',
    cell: (info) => info.getValue() ?? '—',
  }),
  columnHelper.accessor('commodity_type', {
    header: 'Type',
    cell: (info) => info.getValue() ?? '—',
  }),
  columnHelper.accessor('brand_name', {
    header: 'Brand',
    cell: (info) => info.getValue() ?? '—',
  }),
  columnHelper.accessor('model_name', {
    header: 'Model',
    cell: (info) => info.getValue() ?? '—',
  }),
  columnHelper.accessor('serial_number', {
    header: 'Serial Number',
    cell: (info) => info.getValue() ?? '—',
  }),
  columnHelper.accessor('location', {
    header: 'Location',
    cell: (info) => info.getValue() ?? '—',
  }),
  columnHelper.accessor('status', {
    header: 'Status',
    cell: (info) => info.getValue() ?? '—',
  }),
  columnHelper.accessor('is_active', {
    header: 'Active',
    cell: (info) => (info.getValue() ? 'Yes' : 'No'),
  }),
  columnHelper.accessor('assigned_users', {
    header: 'Assigned To',
    cell: (info) => {
      const users = info.getValue();
      return users.length > 0 ? users.map((u) => u.name).join(', ') : '—';
    },
  }),
];

interface AssetTableProps {
  assets: Asset[];
}

export default function AssetTable({ assets }: AssetTableProps) {
  const table = useReactTable({
    data: assets,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="bg-white rounded-lg shadow overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap"
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-gray-200">
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="hover:bg-gray-50">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}