import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardOverview from './pages/DashboardOverview';
import AssetsPage from './pages/AssetsPage';
import PeoplePage from './pages/PeoplePage';
import UserDetailPage from './pages/UserDetailPage';
import UploadPage from './pages/UploadPage';
import DuplicatesPage from './pages/DuplicatesPage';
import DashboardLayout from './components/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoutes';
import AdminRoute from './components/AdminRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardOverview />} />
          <Route path="/assets" element={<AssetsPage />} />
          <Route path="/users" element={<PeoplePage />} />
          <Route path="/users/:id" element={<UserDetailPage />} />
          <Route path="/upload" element={<AdminRoute><UploadPage /></AdminRoute>} />
          <Route path="/duplicates" element={<AdminRoute><DuplicatesPage /></AdminRoute>} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;