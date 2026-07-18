import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, Users, Upload, Copy, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';
import Chip from './Chip';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, adminOnly: false },
  { to: '/assets', label: 'Assets', icon: Package, adminOnly: false },
  { to: '/users', label: 'Users', icon: Users, adminOnly: false },
  { to: '/upload', label: 'Upload', icon: Upload, adminOnly: true },
  { to: '/duplicates', label: 'Duplicates', icon: Copy, adminOnly: true },
];

export default function Sidebar() {
  const { role, name, logout } = useAuth();

  return (
    <aside className="w-60 shrink-0 bg-surface border-r border-border-subtle flex flex-col h-screen">
      <div className="px-5 py-5 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
          <LayoutDashboard className="w-4 h-4 text-white" />
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-gray-800 text-sm leading-tight truncate">Asset Dashboard</p>
          <p className="text-xs text-gray-400 leading-tight">Workspace</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-2 space-y-1">
        {NAV_ITEMS.filter((item) => !item.adminOnly || role === 'admin').map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive ? 'bg-primary/8 text-primary font-medium' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }`
            }
          >
            <item.icon className="w-4.5 h-4.5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-border-subtle">
        <div className="flex items-center gap-2.5 px-2 mb-2">
          {name && <Avatar name={name} size="sm" />}
          <div className="min-w-0">
            <p className="text-sm text-gray-800 font-medium truncate leading-tight">{name}</p>
            {role && <Chip bg="bg-primary/8" text="text-primary">{role}</Chip>}
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-500 hover:bg-gray-50"
        >
          <LogOut className="w-[18px] h-[18px]" /> Logout
        </button>
      </div>
    </aside>
  );
}