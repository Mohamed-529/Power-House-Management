import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Zap, AlertCircle } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import type { Role } from '../types';

const schema = z.object({
  email: z.string().email('Enter a valid email address (e.g. name@gmail.com)'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['Fleet Manager', 'Dispatcher', 'Safety Officer', 'Financial Analyst']),
  remember: z.boolean().optional(),
});

type FormData = z.infer<typeof schema>;

const roles: Role[] = ['Fleet Manager', 'Dispatcher', 'Safety Officer', 'Financial Analyst'];

const roleAccess: Record<Role, string> = {
  'Fleet Manager':    'Dashboard, Fleet, Maintenance, Analytics, Settings',
  'Dispatcher':       'Dashboard, Fleet, Drivers, Trips',
  'Safety Officer':   'Dashboard, Drivers, Maintenance',
  'Financial Analyst':'Dashboard, Fuel & Expenses, Analytics',
};

export default function Login() {
  const navigate = useNavigate();
  const login = useAppStore((s) => s.login);
  const [error, setError] = useState('');
  const [failCount, setFailCount] = useState(0);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'Dispatcher', remember: false },
  });

  const onSubmit = async (data: FormData) => {
    setError('');
    if (failCount >= 5) {
      setError('Account locked after 5 failed attempts.');
      return;
    }
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          role: data.role.toUpperCase().replace(/ /g, '_'),
        }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Invalid credentials.');
      }
      const result = await response.json();
      const user = {
        id: String(result.id || '1'),
        name: result.name || data.email.split('@')[0],
        email: result.email || data.email,
        role: data.role
      };
      login(user, 'mock-jwt-token');
      navigate('/dashboard', { replace: true });
    } catch (e: any) {
      setFailCount((c) => c + 1);
      setError(e.message || 'Invalid credentials.');
    }
  };

  return (
    <div className="min-h-screen flex bg-bg">
      {/* Left panel */}
      <div className="w-[420px] min-h-screen bg-[#1a1e28] border-r border-border flex flex-col justify-between p-10 shrink-0">
        <div>
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-warning rounded-xl flex items-center justify-center">
              <Zap size={20} className="text-black" />
            </div>
            <div>
              <div className="font-bold text-white text-lg">FleetOps</div>
              <div className="text-xs text-gray-400">Smart Transport Operations Platform</div>
            </div>
          </div>

          <p className="text-gray-400 text-sm leading-relaxed mb-8">
            Enterprise fleet management for modern logistics companies. Real-time dispatch, compliance tracking, and financial insights — all in one platform.
          </p>

          <div className="mb-2">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-3">One login, four roles:</p>
            <ul className="space-y-2">
              {roles.map((r) => (
                <li key={r} className="flex items-center gap-2 text-sm text-gray-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-warning shrink-0" />
                  {r}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="space-y-1.5">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-2">Access scoped by role:</p>
          {roles.map((r) => (
            <p key={r} className="text-xs text-gray-500">
              <span className="text-gray-400">• {r}</span> → {roleAccess[r]}
            </p>
          ))}
        </div>

        <div className="text-xs text-gray-700">FLEETOPS © 2026 · RBAC ERP</div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-bold text-white mb-1">Sign in to your account</h1>
          <p className="text-sm text-gray-400 mb-8">Enter your credentials to continue</p>

          {error && (
            <div className="flex items-start gap-2 bg-danger/10 border border-danger/30 rounded-lg px-3 py-2.5 mb-5 text-sm text-danger">
              <AlertCircle size={15} className="mt-0.5 shrink-0" />
              <div>
                <span>{error}</span>
                {failCount >= 5 && <span className="block text-xs mt-0.5">Account locked after 5 failed attempts.</span>}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input {...register('email')} className="input" placeholder="name@fleetops.in" />
              {errors.email && <p className="text-xs text-danger mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="label">Password</label>
              <input {...register('password')} type="password" className="input" placeholder="••••••••" />
              {errors.password && <p className="text-xs text-danger mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="label">Role (RBAC)</label>
              <select {...register('role')} className="input bg-bg">
                {roles.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
                <input {...register('remember')} type="checkbox" className="w-3.5 h-3.5 accent-warning" />
                Remember me
              </label>
              <button type="button" className="text-sm text-primary hover:text-blue-400 transition-colors">
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-warning py-2.5 text-sm font-semibold"
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
