import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LayoutDashboard, ShieldCheck, Lock, SlidersHorizontal, Copy } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const FEATURES = [
  { icon: ShieldCheck, text: 'Role-based access for admins and viewers' },
  { icon: Lock, text: 'Encrypted invoice storage' },
  { icon: SlidersHorizontal, text: 'Real-time filtering across your asset inventory' },
  { icon: Copy, text: 'Automatic duplicate detection with admin review' },
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(email, password, remember);
      navigate('/dashboard');
    } catch {
      setError('Invalid email or password');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-primary flex-col justify-center px-16 text-white">
        <LayoutDashboard className="w-10 h-10 mb-6" />
        <h1 className="text-3xl font-semibold mb-3">Asset Dashboard</h1>
        <p className="text-blue-100 leading-relaxed mb-8">
          Centralized visibility into every device, assignment, and invoice across your organization.
        </p>
        <ul className="space-y-4">
          {FEATURES.map((f) => (
            <li key={f.text} className="flex items-start gap-3">
              <f.icon className="w-5 h-5 text-blue-200 shrink-0 mt-0.5" />
              <span className="text-sm text-blue-50">{f.text}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex-1 flex items-center justify-center bg-app-bg px-6">
        <form onSubmit={handleSubmit} className="bg-surface p-8 rounded-xl shadow-sm w-full max-w-sm">
          <h2 className="text-xl font-semibold mb-1 text-gray-800">Welcome back</h2>
          <p className="text-sm text-gray-500 mb-6">Sign in to continue</p>

          {error && <div className="bg-danger-bg text-danger px-4 py-2 rounded-lg mb-4 text-sm">{error}</div>}

          <label className="block mb-1.5 text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            required
          />

          <label className="block mb-1.5 text-sm font-medium text-gray-700">Password</label>
          <div className="relative mb-3">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex items-center justify-between mb-6">
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="rounded border-gray-300 text-primary focus:ring-primary/20"
              />
              Remember me
            </label>
            <button
              type="button"
              onClick={() => toast('Contact your administrator to reset your password.')}
              className="text-sm text-primary hover:underline"
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary text-white py-2.5 rounded-lg hover:bg-primary-hover disabled:bg-blue-300 transition-colors text-sm font-medium"
          >
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}