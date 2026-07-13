import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { logout } = useAuth();

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
      <h1 className="text-xl font-bold text-gray-800">Asset Dashboard</h1>
      <button
        onClick={logout}
        className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800 text-sm"
      >
        Logout
      </button>
    </header>
  );
}