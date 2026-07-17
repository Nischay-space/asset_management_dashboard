import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  createColumnHelper,
  flexRender,
  type SortingState,
} from '@tanstack/react-table';
import { useState } from 'react';
import StatusBadge from './StatusBadge';
import { orDash } from '../utils/format';
import type { Asset } from '../types/asset';
import Chip from './Chip';
import RowActionsMenu from './RowActionsMenu';

const columnHelper = createColumnHelper<Asset>();



interface AssetTableProps {
  assets: Asset[];
  onRowClick: (id: number) => void;
  onEdit: (asset: Asset) => void;
  onDelete: (asset: Asset) => void;
}

export default function AssetTable({ assets, onRowClick, onEdit, onDelete }: AssetTableProps) {

  const [sorting, setSorting] = useState<SortingState>([]);
  const columns = [
  columnHelper.accessor('asset_code', {
    header: 'Asset Code',
    cell: (info) => <span className="text-primary font-medium">{info.getValue()}</span>,
  }),
  columnHelper.accessor('name', {
    header: 'Name',
  }),
  columnHelper.accessor('category', {
    header: 'Category',
    cell: (info) => orDash(info.getValue())
  }),
  columnHelper.accessor('commodity_type', {
    header: 'Type',
    cell: (info) => orDash(info.getValue())
  }),
  columnHelper.accessor('brand_name', {
    header: 'Brand',
    cell: (info) => info.getValue() ? <Chip outlined>{info.getValue()}</Chip> : orDash(null),
  }),
  columnHelper.accessor('model_name', {
    header: 'Model',
    cell: (info) => orDash(info.getValue())
  }),
  columnHelper.accessor('serial_number', {
    header: 'Serial Number',
    cell: (info) => orDash(info.getValue())
  }),
  columnHelper.accessor('location', {
    header: 'Location',
    cell: (info) => orDash(info.getValue())
  }),
  columnHelper.accessor('status', {
    header: 'Status',
    cell: (info) => <StatusBadge status={info.getValue()} />,
  }),

  columnHelper.accessor('assigned_users', {
    header: 'Assigned To',
    cell: (info) => {
      const users = info.getValue();
      return users.length > 0 ? users.map((u) => u.name).join(', ') : '—';
    },
  }),
  columnHelper.display({
    id: 'actions',
    header: '',
    cell: ({ row }) => (
      <RowActionsMenu
        onEdit={() => onEdit(row.original)}
        onDelete={() => onDelete(row.original)}
      />
    ),
  }),
];

  const table = useReactTable({
    data: assets,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });


  return (
    <div className="bg-white rounded-lg shadow overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-100">
        <thead className="bg-gray-50 sticky top-0 z-1">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  onClick={header.column.getToggleSortingHandler()}
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap cursor-pointer select-none hover:bg-gray-100 transition-colors"
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                  {{ asc: ' ▲', desc: ' ▼' }[header.column.getIsSorted() as string] ?? ''}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-gray-50">
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              onClick={() => onRowClick(row.original.id)}
              className="hover:bg-gray-50 cursor-pointer transition-colors"
            >
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  onClick={cell.column.id === 'actions' ? (e) => e.stopPropagation() : undefined}
                  className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap"
                >
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