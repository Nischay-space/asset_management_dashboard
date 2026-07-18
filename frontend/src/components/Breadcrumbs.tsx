import { Link, useLocation, useParams } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const ROUTE_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  assets: 'Assets',
  users: 'Users',
  upload: 'Upload',
  duplicates: 'Duplicates',
};

export default function Breadcrumbs() {
  const location = useLocation();
  const params = useParams();

  const segments = location.pathname.split('/').filter(Boolean);

  const crumbs = segments.map((segment, index) => {
    const path = '/' + segments.slice(0, index + 1).join('/');
    const isId = segment === params.id;
    const label = isId ? `#${segment}` : (ROUTE_LABELS[segment] ?? segment);
    return { path, label };
  });

  return (
    <nav className="flex items-center text-sm text-gray-500 mb-2">
      {crumbs.map((crumb, index) => (
        <span key={crumb.path} className="flex items-center">
          {index > 0 && <ChevronRight className="w-3.5 h-3.5 mx-1 text-gray-300" />}
          <Link to={crumb.path} className="hover:text-gray-700 last:text-gray-700 last:font-medium">
            {crumb.label}
          </Link>
        </span>
      ))}
    </nav>
  );
}