import React, { useState } from 'react';
import { X, Mail, Lock, User as UserIcon, Phone, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';
import { DEMO_USERS } from '../data/mockData';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'register';
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'login',
  onClose,
}) => {
  const { login, register, quickLogin } = useAuth();
  const { showToast } = useBooking();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Sync mode if initialMode changes
  React.useEffect(() => {
    setMode(initialMode);
    setError(null);
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await login(email, password);
        if (res.success) {
          showToast('Signed in successfully!', 'success');
          onClose();
        } else {
          setError(res.message || 'Failed to sign in. Please verify your email.');
        }
      } else {
        const res = await register(name, email, phone, password);
        if (res.success) {
          showToast('Account created! Welcome to BookWell.', 'success');
          onClose();
        } else {
          setError(res.message || 'Could not create account. Please check inputs.');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (userId: string) => {
    quickLogin(userId);
    const demo = DEMO_USERS.find(u => u.id === userId);
    showToast(`Signed in as ${demo?.name} (${demo?.role})`, 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 text-center">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-zinc-900/60 transition-opacity backdrop-blur-xs"
          onClick={onClose}
        />

        {/* Modal Window */}
        <div className="relative w-full max-w-md transform overflow-hidden rounded-xl bg-white p-6 text-left shadow-2xl transition-all border border-zinc-200 z-10">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
            <div>
              <h2 className="text-xl font-bold text-zinc-900">
                {mode === 'login' ? 'Sign In to Your Account' : 'Create an Account'}
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                {mode === 'login'
                  ? 'Manage your bookings and view upcoming schedules'
                  : 'Book faster and keep track of your appointments'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Demo Selector */}
          <div className="my-4 p-3 bg-zinc-50 rounded-lg border border-zinc-200">
            <p className="text-xs font-semibold text-zinc-700 mb-2">
              Quick Demo Sign-In (1-Click)
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('usr-1')}
                className="text-left px-2.5 py-1.5 text-xs bg-white border border-zinc-200 hover:border-zinc-400 rounded-md transition-colors"
              >
                <span className="font-medium text-zinc-900 block truncate">Jane Doe</span>
                <span className="text-[11px] text-zinc-500">Client demo</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('usr-3')}
                className="text-left px-2.5 py-1.5 text-xs bg-white border border-zinc-200 hover:border-zinc-400 rounded-md transition-colors"
              >
                <span className="font-medium text-zinc-900 block truncate">Dr. Emily Brooks</span>
                <span className="text-[11px] text-zinc-500">Staff provider</span>
              </button>
            </div>
          </div>

          <div className="relative flex items-center my-4">
            <div className="flex-grow border-t border-zinc-200" />
            <span className="flex-shrink mx-3 text-xs text-zinc-400 font-medium uppercase">
              Or with email
            </span>
            <div className="flex-grow border-t border-zinc-200" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {error && (
              <div className="p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}

            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Sarah Connor"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900"
                />
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-sm rounded-md transition-colors shadow-2xs flex items-center justify-center gap-2 mt-4"
            >
              {loading ? (
                <span>Processing...</span>
              ) : mode === 'login' ? (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <CheckCircle2 className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Toggle Login / Register */}
          <div className="mt-4 pt-3 text-center border-t border-zinc-100">
            {mode === 'login' ? (
              <p className="text-xs text-zinc-600">
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setError(null);
                  }}
                  className="font-semibold text-blue-600 hover:text-blue-800"
                >
                  Create one now
                </button>
              </p>
            ) : (
              <p className="text-xs text-zinc-600">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError(null);
                  }}
                  className="font-semibold text-blue-600 hover:text-blue-800"
                >
                  Sign in
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
