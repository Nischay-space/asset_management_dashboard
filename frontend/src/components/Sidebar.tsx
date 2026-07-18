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
    <aside className="w-56 shrink-0 bg-white border-r border-gray-200 flex flex-col h-screen">
      <div className="px-4 py-4 flex items-center gap-2 border-b border-gray-100">
        <LayoutDashboard className="w-5 h-5 text-primary" />
        <span className="font-semibold text-gray-800">Asset Dashboard</span>
      </div>

      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {NAV_ITEMS.filter((item) => !item.adminOnly || role === 'admin').map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive ? 'bg-blue-50 text-primary font-medium' : 'text-gray-600 hover:bg-gray-50'
              }`
            }
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-gray-100">
        <div className="flex items-center gap-2 mb-3">
          {name && <Avatar name={name} size="sm" />}
          <div className="min-w-0">
            <p className="text-sm text-gray-800 font-medium truncate">{name}</p>
            {role && <Chip bg="bg-blue-50" text="text-primary">{role}</Chip>}
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-50"
        >
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>
    </aside>
  );
}