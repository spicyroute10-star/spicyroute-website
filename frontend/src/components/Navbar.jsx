import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { 
  Home, Heart, ShoppingCart, FileText, Menu as MenuIcon, 
  ShieldAlert, Store, User, LogOut, Flame, LayoutDashboard, Layers, UtensilsCrossed, Bike
} from 'lucide-react';

export default function Navbar({ onOpenCart, activeView, setActiveView }) {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();

  const isVendor = user?.role === 'VENDOR';
  const isAdmin = user?.role === 'ADMIN';

  const getRoleBadge = () => {
    if (!user) return null;
    if (user.role === 'ADMIN') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-purple-100 text-purple-800 border border-purple-300">
          <ShieldAlert className="w-3 h-3" /> Admin
        </span>
      );
    }
    if (user.role === 'VENDOR') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-300">
          <Store className="w-3 h-3" /> Vendor
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
        <User className="w-3 h-3" /> Customer
      </span>
    );
  };

  return (
    <>
      {/* Desktop & Tablet Top Header Bar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <div 
            onClick={() => setActiveView(isVendor ? 'vendor' : 'storefront')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 via-rose-500 to-amber-500 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform flex-shrink-0">
              <Flame className="w-6 h-6 fill-amber-200 text-amber-200" />
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-black tracking-tight bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600 bg-clip-text text-transparent">
                Spice Route
              </span>
              <span className="hidden sm:block text-[9px] font-extrabold text-rose-500 tracking-widest uppercase">
                {isVendor ? 'VENDOR MANAGEMENT PORTAL' : 'AUTHENTIC FOOD DELIVERY'}
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 bg-gray-100 p-1 rounded-2xl border border-gray-200">
            {isAdmin && (
              <button
                onClick={() => setActiveView('admin')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all ${
                  activeView === 'admin' ? 'bg-purple-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" /> Admin Analytics
              </button>
            )}

            {isVendor ? (
              <>
                <button
                  onClick={() => setActiveView('vendor')}
                  className={`px-4 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all ${
                    activeView === 'vendor' ? 'bg-amber-600 text-white shadow-md' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Layers className="w-4 h-4" /> Live Kanban Orders & Menu
                </button>
                <button
                  onClick={() => setActiveView('storefront')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all ${
                    activeView === 'storefront' ? 'bg-white text-rose-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Home className="w-3.5 h-3.5" /> Storefront Preview
                </button>
                <button
                  onClick={() => setActiveView('menu-profile')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all ${
                    activeView === 'menu-profile' ? 'bg-white text-rose-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <MenuIcon className="w-3.5 h-3.5" /> Account Settings
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setActiveView('storefront')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    activeView === 'storefront' ? 'bg-white text-rose-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Home className="w-3.5 h-3.5" /> Home
                </button>
                <button
                  onClick={() => setActiveView('favourites')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    activeView === 'favourites' ? 'bg-white text-rose-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Heart className="w-3.5 h-3.5" /> Favourite
                </button>
                <button
                  onClick={() => setActiveView('my-orders')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    activeView === 'my-orders' ? 'bg-white text-rose-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" /> Orders
                </button>
                <button
                  onClick={() => setActiveView('menu-profile')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    activeView === 'menu-profile' ? 'bg-white text-rose-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <MenuIcon className="w-3.5 h-3.5" /> Menu
                </button>
              </>
            )}
          </nav>

          {/* Desktop Actions */}
          <div className="flex items-center gap-3">
            
            {/* Customer Cart Button (Hidden for Vendor) */}
            {!isVendor && (
              <button
                onClick={onOpenCart}
                className="relative p-2.5 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors flex items-center justify-center"
                title="Open Cart"
              >
                <ShoppingCart className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-bounce">
                    {itemCount}
                  </span>
                )}
              </button>
            )}

            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
                <div className="text-right">
                  <span className="block text-xs font-extrabold text-gray-900 leading-tight">{user.name}</span>
                  {getRoleBadge()}
                </div>
                <button
                  onClick={logout}
                  className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                  title="Log Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setActiveView('login')}
                className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold px-4 py-2 rounded-xl text-xs transition-all shadow-sm"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      {isVendor ? (
        /* VENDOR ONLY MOBILE BOTTOM NAV */
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-2xl py-1.5 px-4">
          <div className="max-w-md mx-auto flex items-center justify-around">
            
            {/* Vendor Tab 1: Live Orders */}
            <button
              onClick={() => setActiveView('vendor')}
              className={`flex flex-col items-center justify-center py-1 px-3 transition-all ${
                activeView === 'vendor' ? 'text-amber-600 font-black scale-105' : 'text-gray-500 font-bold'
              }`}
            >
              <Layers className="w-5 h-5" />
              <span className="text-[11px] mt-0.5">Live Orders</span>
            </button>

            {/* Vendor Tab 2: Store Preview */}
            <button
              onClick={() => setActiveView('storefront')}
              className={`flex flex-col items-center justify-center py-1 px-3 transition-all ${
                activeView === 'storefront' ? 'text-amber-600 font-black scale-105' : 'text-gray-500 font-bold'
              }`}
            >
              <Home className="w-5 h-5" />
              <span className="text-[11px] mt-0.5">Store Preview</span>
            </button>

            {/* Vendor Tab 3: Account & Settings */}
            <button
              onClick={() => setActiveView('menu-profile')}
              className={`flex flex-col items-center justify-center py-1 px-3 transition-all ${
                activeView === 'menu-profile' ? 'text-amber-600 font-black scale-105' : 'text-gray-500 font-bold'
              }`}
            >
              <MenuIcon className="w-5 h-5" />
              <span className="text-[11px] mt-0.5">Account</span>
            </button>

          </div>
        </div>
      ) : (
        /* CUSTOMER ONLY MOBILE BOTTOM NAV (With Center Elevated Red Cart Button) */
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-2xl py-1 px-4">
          <div className="max-w-md mx-auto flex items-center justify-between relative">
            
            {/* Tab 1: Home */}
            <button
              onClick={() => setActiveView('storefront')}
              className={`flex flex-col items-center justify-center w-14 py-1.5 transition-all ${
                activeView === 'storefront' ? 'text-rose-600 font-black' : 'text-gray-500 font-bold'
              }`}
            >
              <Home className={`w-5 h-5 ${activeView === 'storefront' ? 'stroke-[2.5]' : ''}`} />
              <span className="text-[11px] mt-0.5">Home</span>
            </button>

            {/* Tab 2: Favourite */}
            <button
              onClick={() => setActiveView('favourites')}
              className={`flex flex-col items-center justify-center w-14 py-1.5 transition-all ${
                activeView === 'favourites' ? 'text-rose-600 font-black' : 'text-gray-500 font-bold'
              }`}
            >
              <Heart className={`w-5 h-5 ${activeView === 'favourites' ? 'fill-rose-600 stroke-rose-600' : ''}`} />
              <span className="text-[11px] mt-0.5">Favourite</span>
            </button>

            {/* Tab 3: Center Elevated Floating Red Cart Button */}
            <div className="relative -top-5 flex justify-center">
              <button
                onClick={onOpenCart}
                className="w-14 h-14 bg-gradient-to-tr from-rose-700 via-rose-600 to-red-500 text-white rounded-full flex items-center justify-center shadow-xl border-4 border-white active:scale-95 transition-transform"
                title="View Cart"
              >
                <ShoppingCart className="w-6 h-6" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber-400 text-gray-900 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-white">
                    {itemCount}
                  </span>
                )}
              </button>
            </div>

            {/* Tab 4: Orders */}
            <button
              onClick={() => setActiveView('my-orders')}
              className={`flex flex-col items-center justify-center w-14 py-1.5 transition-all ${
                activeView === 'my-orders' ? 'text-rose-600 font-black' : 'text-gray-500 font-bold'
              }`}
            >
              <FileText className={`w-5 h-5 ${activeView === 'my-orders' ? 'stroke-[2.5]' : ''}`} />
              <span className="text-[11px] mt-0.5">Orders</span>
            </button>

            {/* Tab 5: Menu */}
            <button
              onClick={() => setActiveView('menu-profile')}
              className={`flex flex-col items-center justify-center w-14 py-1.5 transition-all ${
                activeView === 'menu-profile' ? 'text-rose-600 font-black' : 'text-gray-500 font-bold'
              }`}
            >
              <MenuIcon className={`w-5 h-5 ${activeView === 'menu-profile' ? 'stroke-[2.5]' : ''}`} />
              <span className="text-[11px] mt-0.5">Menu</span>
            </button>

          </div>
        </div>
      )}
    </>
  );
}
