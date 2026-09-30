import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import CartDrawer from './components/customer/CartDrawer';
import AdminDashboardPage from './pages/AdminDashboardPage';
import VendorPortalPage from './pages/VendorPortalPage';
import CustomerStorefrontPage from './pages/CustomerStorefrontPage';
import FavouritesPage from './pages/FavouritesPage';
import ProfileMenuPage from './pages/ProfileMenuPage';
import BlankLegalPage from './pages/BlankLegalPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import LoginPage from './pages/LoginPage';
import AuthCallbackPage from './pages/AuthCallbackPage';

// Keep Render backend alive — ping every 10 min to prevent free-tier sleep
const BACKEND_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || '';
if (BACKEND_URL) {
  const pingBackend = () => fetch(`${BACKEND_URL}/api/health`).catch(() => {});
  pingBackend();
  setInterval(pingBackend, 10 * 60 * 1000);
}

// Detect if Google OAuth is redirecting back to us
const isOAuthCallback = window.location.pathname === '/auth/callback' ||
  window.location.pathname.startsWith('/auth/callback');

function MainApp() {
  const { user } = useAuth();

  // Read ?view=admin or ?view=vendor from URL (set by OAuth callback)
  const urlParams = new URLSearchParams(window.location.search);
  const viewFromUrl = urlParams.get('view');

  const [activeView, setActiveView] = useState(() => {
    if (viewFromUrl === 'admin') return 'admin';
    if (viewFromUrl === 'vendor') return 'vendor';
    return 'storefront';
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeOrderForTracking, setActiveOrderForTracking] = useState(null);
  const [legalTitle, setLegalTitle] = useState('Terms & Conditions');

  // Favourites State with LocalStorage Persistence
  const [favourites, setFavourites] = useState(() => {
    try {
      const saved = localStorage.getItem('spice_route_favs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('spice_route_favs', JSON.stringify(favourites));
    } catch (e) {
      console.error('Failed to save favourites:', e);
    }
  }, [favourites]);

  const handleToggleFavourite = (item) => {
    setFavourites((prev) => {
      const exists = prev.some((f) => f.id === item.id);
      if (exists) {
        return prev.filter((f) => f.id !== item.id);
      } else {
        return [...prev, item];
      }
    });
  };

  const handleOpenLegal = (title) => {
    setLegalTitle(title);
    if (title === 'Privacy Policy') {
      setActiveView('privacy');
    } else {
      setActiveView('terms');
    }
  };

  const handleOrderPlaced = (order) => {
    setActiveOrderForTracking(order);
    setActiveView('my-orders');
  };

  const handleLoginSuccess = (userRole) => {
    if (userRole === 'ADMIN') {
      setActiveView('admin');
    } else if (userRole === 'VENDOR') {
      setActiveView('vendor');
    } else {
      setActiveView('storefront');
    }
  };

  const renderActiveView = () => {
    if (activeView === 'login') {
      return <LoginPage onSuccess={handleLoginSuccess} onCancel={() => setActiveView('storefront')} />;
    }

    if (activeView === 'admin') {
      if (user?.role !== 'ADMIN') {
        return (
          <div className="max-w-xl mx-auto my-12 p-8 bg-white rounded-3xl border border-gray-200 text-center space-y-4 shadow-sm">
            <h3 className="text-xl font-extrabold text-purple-600">Super Admin Access Required</h3>
            <p className="text-xs text-gray-500 font-semibold">
              Please sign in with a Super Admin account to access platform analytics.
            </p>
            <button
              onClick={() => setActiveView('login')}
              className="px-5 py-2.5 bg-purple-600 text-white rounded-xl text-xs font-black shadow-md hover:bg-purple-700"
            >
              Sign In as Super Admin
            </button>
          </div>
        );
      }
      return <AdminDashboardPage />;
    }

    if (activeView === 'vendor') {
      if (user?.role !== 'VENDOR' && user?.role !== 'ADMIN') {
        return (
          <div className="max-w-xl mx-auto my-12 p-8 bg-white rounded-3xl border border-gray-200 text-center space-y-4 shadow-sm">
            <h3 className="text-xl font-extrabold text-amber-600">Restaurant Vendor Account Required</h3>
            <p className="text-xs text-gray-500 font-semibold">
              Please sign in with a Restaurant Vendor account to access your live order Kanban board and menu management.
            </p>
            <button
              onClick={() => setActiveView('login')}
              className="px-5 py-2.5 bg-amber-600 text-white rounded-xl text-xs font-black shadow-md hover:bg-amber-700"
            >
              Sign In as Restaurant Vendor
            </button>
          </div>
        );
      }
      return <VendorPortalPage />;
    }

    if (activeView === 'favourites') {
      return (
        <FavouritesPage
          favourites={favourites}
          onToggleFavourite={handleToggleFavourite}
          onOpenCart={() => setIsCartOpen(true)}
        />
      );
    }

    if (activeView === 'menu-profile') {
      return (
        <ProfileMenuPage
          onOpenLegal={handleOpenLegal}
          setActiveView={setActiveView}
        />
      );
    }

    if (activeView === 'terms') {
      return <BlankLegalPage title="Terms & Conditions" onBack={() => setActiveView('menu-profile')} />;
    }

    if (activeView === 'privacy') {
      return <BlankLegalPage title="Privacy Policy" onBack={() => setActiveView('menu-profile')} />;
    }

    if (activeView === 'my-orders') {
      return <OrderTrackingPage />;
    }

    return (
      <CustomerStorefrontPage
        onOpenCart={() => setIsCartOpen(true)}
        favourites={favourites}
        onToggleFavourite={handleToggleFavourite}
      />
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navbar Header */}
      <Navbar
        onOpenCart={() => setIsCartOpen(true)}
        activeView={activeView}
        setActiveView={setActiveView}
      />

      {/* Main View Area */}
      <main className="flex-1">
        {renderActiveView()}
      </main>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onOrderPlaced={handleOrderPlaced}
        onRequireLogin={() => setActiveView('login')}
      />

      {/* Production Footer */}
      <footer className="bg-white border-t border-gray-200 py-6 text-center text-xs font-semibold text-gray-400 mt-12 pb-24">
        Spice Route Platform © 2026 • Real-Time Multi-Vendor Food Ordering Platform
      </footer>
    </div>
  );
}

export default function App() {
  // If this is the Google OAuth callback URL, render only the callback handler
  if (isOAuthCallback) {
    return (
      <AuthProvider>
        <AuthCallbackPage />
      </AuthProvider>
    );
  }

  return (
    <AuthProvider>
      <CartProvider>
        <MainApp />
      </CartProvider>
    </AuthProvider>
  );
}
