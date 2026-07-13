import { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getExpandedRowModel,
  createColumnHelper,
  flexRender,
  type ExpandedState,
} from '@tanstack/react-table';
import { useNavigate } from 'react-router-dom';
import type { UserWithAssets } from '../types/asset';

const columnHelper = createColumnHelper<UserWithAssets>();

function groupByCommodityType(assets: UserWithAssets['assigned_assets']) {
  const counts = assets.reduce<Record<string, number>>((acc, asset) => {
    const key = asset.commodity_type ?? 'Other';
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
  return Object.entries(counts);
}

const columns = [
  columnHelper.display({
    id: 'expander',
    header: '',
    cell: ({ row }) => (
      <button onClick={row.getToggleExpandedHandler()} className="text-gray-400 hover:text-gray-700">
        {row.getIsExpanded() ? '▾' : '▸'}
      </button>
    ),
  }),
  columnHelper.accessor('name', {
    header: 'Name',
    cell: ({ row, getValue }) => (
      <NameLink id={row.original.id} name={getValue()} />
    ),
  }),
  columnHelper.accessor('email', { header: 'Email', cell: (info) => info.getValue() ?? '—' }),
  columnHelper.accessor('role', { header: 'Role' }),
  columnHelper.display({
    id: 'assetBreakdown',
    header: 'Assets',
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1">
        {groupByCommodityType(row.original.assigned_assets).map(([type, count]) => (
          <span key={type} className="text-xs bg-gray-100 text-gray-600 rounded px-2 py-0.5 whitespace-nowrap">
            {type} × {count}
          </span>
        ))}
      </div>
    ),
  }),
];
function NameLink({ id, name }: { id: number; name: string }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(`/users/${id}`)}
      className="text-blue-600 hover:underline font-medium text-left"
    >
      {name}
    </button>
  );
}

interface UserTableProps {
  users: UserWithAssets[];
  onAssetClick: (id: number) => void;
}

export default function UserTable({ users, onAssetClick }: UserTableProps) {
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const navigate = useNavigate();

  const table = useReactTable({
    data: users,
    columns,
    state: { expanded },
    onExpandedChange: setExpanded,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: () => true,
  });

  return (
    <div className="bg-white rounded-lg shadow overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id}>
              {hg.headers.map((header) => (
                <th key={header.id} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase whitespace-nowrap">
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-gray-200">
          {table.getRowModel().rows.map((row) => (
            <>
              <tr key={row.id} className="hover:bg-gray-50">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
              {row.getIsExpanded() && (
                <tr key={`${row.id}-expanded`}>
                  <td colSpan={columns.length} className="bg-gray-50 px-8 py-3">
                    <div className="flex flex-wrap gap-2">
                      {row.original.assigned_assets.map((asset) => (
                        <button
                          key={asset.id}
                          onClick={() => onAssetClick(asset.id)}
                          className="text-xs bg-white border border-gray-200 rounded px-2 py-1 hover:border-blue-400"
                        >
                          {asset.commodity_type ?? asset.name} · {asset.asset_code}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              )}
            </>
          ))}
        </tbody>
      </table>
    </div>
  );
}