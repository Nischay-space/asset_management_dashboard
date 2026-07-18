import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Breadcrumbs from './Breadcrumbs';

export default function DashboardLayout() {
  return (
    <div className="flex h-screen bg-app-bg">
      <Sidebar />
      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className="px-6 pt-4">
          <Breadcrumbs />
        </div>
        <Outlet />
      </main>
    </div>
  );
}