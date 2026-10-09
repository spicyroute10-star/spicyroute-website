import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Flame, Mail, Lock, User, Store, ShieldAlert, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function LoginPage({ onSuccess, onCancel }) {
  const { user, login, logout, register, loginWithGoogle } = useAuth();

  // Mode: 'signin' or 'signup'
  const [mode, setMode] = useState('signin');
  // Role Selection State (Default: CUSTOMER)
  const [selectedRole, setSelectedRole] = useState('CUSTOMER');
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (!name.trim()) {
          setError('Please enter your full name.');
          setLoading(false);
          return;
        }
        const res = await register(email.trim(), password, name.trim(), selectedRole);
        if (res.success) {
          setSuccessMessage('Account created! Logging you in...');
          // Attempt instant login after registration
          try {
            const loggedInUser = await login(email.trim(), password);
            if (onSuccess) {
              onSuccess(loggedInUser?.role || selectedRole);
            }
          } catch {
            setSuccessMessage('Registration successful! Please check your email if confirmation is required.');
          }
        }
      } else {
        const user = await login(email.trim(), password);
        if (onSuccess) {
          onSuccess(user?.role || selectedRole);
        }
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      localStorage.setItem('pending_oauth_role', selectedRole);
      const res = await loginWithGoogle();
      if (res && res.success === false) {
        setError(res.error || 'Google Sign-In is not enabled or failed.');
        setLoading(false);
      } else if (res?.url) {
        window.location.href = res.url;
      }
    } catch (err) {
      setError(err.message || 'Google Sign-In failed.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8 bg-gray-50">
      <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-gray-100 space-y-6">
        
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg mx-auto border border-rose-200/60 bg-rose-50">
            <img src="/logo.png" alt="Spicy Route Logo" className="w-full h-full object-cover" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Spicy Route</h2>
          <p className="text-xs font-semibold text-gray-400">
            {mode === 'signin' ? 'Sign in to access your campus food account' : 'Create an account to get started'}
          </p>
        </div>

        {/* Currently Logged In Account Alert */}
        {user && (
          <div className="p-3.5 bg-purple-50/80 border border-purple-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <p className="font-extrabold text-purple-900">Signed In As:</p>
              <p className="text-purple-700 font-semibold">{user.name} ({user.email})</p>
              <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-200 text-purple-900">
                ROLE: {user.role}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (onSuccess) onSuccess(user.role);
                }}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs shadow-sm transition-all"
              >
                Go to Dashboard
              </button>
              <button
                type="button"
                onClick={logout}
                className="px-3 py-1.5 bg-white text-rose-600 hover:bg-rose-50 font-bold rounded-xl text-xs border border-rose-200 transition-all"
              >
                Log Out
              </button>
            </div>
          </div>
        )}

        {/* Mode Switcher Tabs */}
        <div className="flex bg-gray-100 p-1 rounded-2xl border border-gray-200">
          <button
            type="button"
            onClick={() => { setMode('signin'); setError(''); setSuccessMessage(''); }}
            className={`flex-1 py-2 text-xs font-black rounded-xl transition-all ${
              mode === 'signin' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setError(''); setSuccessMessage(''); }}
            className={`flex-1 py-2 text-xs font-black rounded-xl transition-all ${
              mode === 'signup' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error Notification Alert */}
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-extrabold rounded-2xl text-center">
            {error}
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-extrabold rounded-2xl text-center flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Role Selection */}
        <div className="space-y-2">
          <label className="block text-xs font-extrabold text-gray-700 uppercase">
            Select Role
          </label>
          
          <div className="grid grid-cols-3 gap-2">
            {/* Customer Role */}
            <button
              type="button"
              onClick={() => setSelectedRole('CUSTOMER')}
              className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center space-y-1 ${
                selectedRole === 'CUSTOMER'
                  ? 'bg-rose-50 border-rose-600 text-rose-700 ring-2 ring-rose-500/20 shadow-sm'
                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <User className={`w-5 h-5 ${selectedRole === 'CUSTOMER' ? 'text-rose-600' : 'text-gray-400'}`} />
              <span className="text-[11px] font-black leading-tight">Customer</span>
              <span className="text-[9px] font-semibold text-gray-400">Order Food</span>
            </button>

            {/* Vendor Role */}
            <button
              type="button"
              onClick={() => setSelectedRole('VENDOR')}
              className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center space-y-1 ${
                selectedRole === 'VENDOR'
                  ? 'bg-amber-50 border-amber-600 text-amber-700 ring-2 ring-amber-500/20 shadow-sm'
                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Store className={`w-5 h-5 ${selectedRole === 'VENDOR' ? 'text-amber-600' : 'text-gray-400'}`} />
              <span className="text-[11px] font-black leading-tight">Vendor</span>
              <span className="text-[9px] font-semibold text-gray-400">Restaurant</span>
            </button>

            {/* Super Admin Role */}
            <button
              type="button"
              onClick={() => setSelectedRole('ADMIN')}
              className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center space-y-1 ${
                selectedRole === 'ADMIN'
                  ? 'bg-purple-50 border-purple-600 text-purple-700 ring-2 ring-purple-500/20 shadow-sm'
                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <ShieldAlert className={`w-5 h-5 ${selectedRole === 'ADMIN' ? 'text-purple-600' : 'text-gray-400'}`} />
              <span className="text-[11px] font-black leading-tight">Admin</span>
              <span className="text-[9px] font-semibold text-gray-400">Analytics</span>
            </button>
          </div>
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-extrabold text-gray-700 uppercase mb-1.5">
                Full Name
              </label>
              <div className="flex items-center bg-gray-50 border border-gray-200 rounded-2xl p-3 focus-within:ring-2 focus-within:ring-rose-500">
                <User className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full bg-transparent text-sm font-semibold text-gray-900 focus:outline-none placeholder:text-gray-400"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-extrabold text-gray-700 uppercase mb-1.5">
              Email Address
            </label>
            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-2xl p-3 focus-within:ring-2 focus-within:ring-rose-500">
              <Mail className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-transparent text-sm font-semibold text-gray-900 focus:outline-none placeholder:text-gray-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-gray-700 uppercase mb-1.5">
              Password
            </label>
            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-2xl p-3 focus-within:ring-2 focus-within:ring-rose-500">
              <Lock className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-transparent text-sm font-semibold text-gray-900 focus:outline-none placeholder:text-gray-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs py-3.5 rounded-2xl shadow-lg shadow-rose-600/25 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
          >
            <span>{loading ? 'Please wait...' : mode === 'signin' ? `Sign In as ${selectedRole}` : `Create ${selectedRole} Account`}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-gray-200 w-full"></div>
          <span className="bg-white px-3 text-[11px] font-bold text-gray-400 uppercase">Or</span>
        </div>

        {/* Google Sign-In Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-extrabold text-xs py-3 rounded-2xl flex items-center justify-center gap-2.5 transition-all shadow-xs active:scale-95"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          <span>Continue with Google</span>
        </button>

        {onCancel && (
          <div className="text-center pt-1">
            <button
              type="button"
              onClick={onCancel}
              className="text-xs font-bold text-gray-400 hover:text-gray-600 underline"
            >
              ← Back to Storefront
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
