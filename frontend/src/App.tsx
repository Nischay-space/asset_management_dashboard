import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProtectedRoute from './components/ProtectedRoutes';
import UserDetailPage from './pages/UserDetailPage';
import UploadPage from './pages/UploadPage';
import AdminRoute from './components/AdminRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
        <Route path="/users/:id" element={<ProtectedRoute><UserDetailPage /></ProtectedRoute>} />
        <Route path="/upload" element={<AdminRoute><UploadPage /></AdminRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;