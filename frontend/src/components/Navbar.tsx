import { Link } from 'react-router-dom';
import { LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';
import Chip from './Chip';
import Breadcrumbs from './Breadcrumbs';

export default function Navbar() {
  const { logout, role, name } = useAuth();

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-3 flex flex-col gap-1">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <LayoutDashboard className="w-5 h-5 text-primary" />
          <h1 className="text-lg font-semibold text-gray-800">Asset Dashboard</h1>
          {role === 'admin' && (
            <Link to="/upload" className="ml-4 text-sm text-gray-500 hover:text-primary">
              Upload
            </Link>
          )}
          {role === 'admin' && (
            <Link to="/duplicates" className="ml-4 text-sm text-gray-500 hover:text-primary">
              Duplicates
            </Link>
          )
          }
        </div>

        <div className="flex items-center gap-3">
          {name && <Avatar name={name} size="sm" />}
          <div className="text-sm">
            <p className="text-gray-800 font-medium leading-tight">{name}</p>
            {role && <Chip bg="bg-blue-50" text="text-primary">{role}</Chip>}
          </div>
          <button onClick={logout} className="ml-2 p-2 rounded hover:bg-gray-100 text-gray-500" aria-label="Logout">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
      <Breadcrumbs />
    </header>
  );
}