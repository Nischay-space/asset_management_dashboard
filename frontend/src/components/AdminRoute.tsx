import { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from './ProtectedRoutes';

interface AdminRouteProps {
  children: ReactNode;
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const { role } = useAuth();

  return (
    <ProtectedRoute>
      {role === 'admin' ? children : <Navigate to="/" replace />}
    </ProtectedRoute>
  );
}