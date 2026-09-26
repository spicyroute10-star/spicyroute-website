import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Store, User, Sparkles } from 'lucide-react';

export default function RoleSwitcherBanner() {
  const { user, switchRoleDemo } = useAuth();

  const handleRoleSwitch = async (email, password) => {
    try {
      await switchRoleDemo(email, password);
    } catch (err) {
      alert('Failed to switch role demo account: ' + err.message);
    }
  };

  return (
    <div className="bg-gradient-to-r from-gray-900 via-slate-800 to-gray-900 text-white px-3 sm:px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-2 shadow-inner border-b border-gray-700">
      <div className="flex items-center gap-1.5 sm:gap-2">
        <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-400 animate-pulse flex-shrink-0" />
        <span className="font-extrabold text-[11px] sm:text-xs text-rose-400 uppercase tracking-wider">Demo Switcher:</span>
        <span className="text-gray-300 hidden md:inline text-xs font-medium">Click any role to test live:</span>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 no-scrollbar flex-nowrap w-full sm:w-auto">
        <button
          onClick={() => handleRoleSwitch('admin@fooddelivery.com', 'admin123')}
          className={`flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-lg text-[11px] sm:text-xs font-bold transition-all whitespace-nowrap ${
            user?.role === 'ADMIN'
              ? 'bg-rose-600 text-white ring-2 ring-rose-400 shadow-md scale-105'
              : 'bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-600'
          }`}
        >
          <ShieldAlert className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-rose-300" />
          <span>Super Admin</span>
        </button>

        <button
          onClick={() => handleRoleSwitch('vendor@burgerhub.com', 'vendor123')}
          className={`flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-lg text-[11px] sm:text-xs font-bold transition-all whitespace-nowrap ${
            user?.role === 'VENDOR' && user?.email === 'vendor@burgerhub.com'
              ? 'bg-amber-600 text-white ring-2 ring-amber-400 shadow-md scale-105'
              : 'bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-600'
          }`}
        >
          <Store className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-300" />
          <span>Burger Hub</span>
        </button>

        <button
          onClick={() => handleRoleSwitch('vendor@pizzapalace.com', 'vendor123')}
          className={`flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-lg text-[11px] sm:text-xs font-bold transition-all whitespace-nowrap ${
            user?.role === 'VENDOR' && user?.email === 'vendor@pizzapalace.com'
              ? 'bg-amber-600 text-white ring-2 ring-amber-400 shadow-md scale-105'
              : 'bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-600'
          }`}
        >
          <Store className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-300" />
          <span>Pizza Palace</span>
        </button>

        <button
          onClick={() => handleRoleSwitch('customer@gmail.com', 'customer123')}
          className={`flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-lg text-[11px] sm:text-xs font-bold transition-all whitespace-nowrap ${
            user?.role === 'CUSTOMER'
              ? 'bg-emerald-600 text-white ring-2 ring-emerald-400 shadow-md scale-105'
              : 'bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-600'
          }`}
        >
          <User className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-300" />
          <span>Customer</span>
        </button>
      </div>
    </div>
  );
}
