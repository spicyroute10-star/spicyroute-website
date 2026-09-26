import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  User, Star, ShoppingBag, Wallet, Sun, Moon, 
  MapPin, Settings, Ticket, UserCheck, Store, 
  FileText, Shield, ChevronRight, LogOut, Layers, UtensilsCrossed, Bike, Check, X
} from 'lucide-react';

export default function ProfileMenuPage({ onOpenLegal, setActiveView, ordersCount = 2 }) {
  const { user, logout } = useAuth();
  const isVendor = user?.role === 'VENDOR';

  const [darkMode, setDarkMode] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [editName, setEditName] = useState(user?.name || 'Restaurant Owner');
  const [editPhone, setEditPhone] = useState(user?.phone || '+91 98123 45678');
  const [editAddress, setEditAddress] = useState(user?.address || 'Restaurant Address');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setEditingProfile(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      {/* Top Header Section */}
      <div className={`p-6 sm:p-8 rounded-b-3xl shadow-lg relative text-white ${
        isVendor 
          ? 'bg-gradient-to-r from-amber-600 via-amber-500 to-rose-600' 
          : 'bg-gradient-to-r from-red-600 via-rose-600 to-rose-700'
      }`}>
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Avatar Circle */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/20 backdrop-blur-md border-2 border-white/40 flex items-center justify-center text-white shadow-md">
              {isVendor ? <Store className="w-9 h-9 sm:w-11 sm:h-11 text-white" /> : <User className="w-9 h-9 sm:w-11 sm:h-11 text-white" />}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight">{user?.name || editName}</h1>
                <span className="bg-white/20 backdrop-blur-md text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border border-white/30 text-amber-100">
                  {isVendor ? 'Vendor' : 'Customer'}
                </span>
              </div>
              <p className="text-xs font-semibold text-white/80 mt-0.5">
                {isVendor ? 'Verified Restaurant Partner' : 'Joined 08 Sep, 2026'}
              </p>
            </div>
          </div>

          {/* Light / Dark Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full text-white transition-all shadow-sm"
            title="Toggle Theme"
          >
            {darkMode ? <Sun className="w-5 h-5 text-amber-300" /> : <Moon className="w-5 h-5 text-white" />}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-3xl mx-auto px-4 -mt-6 space-y-6">
        
        {/* Top Stat Cards Row */}
        {isVendor ? (
          /* VENDOR STAT CARDS */
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            <div 
              onClick={() => setActiveView('vendor')}
              className="bg-white rounded-2xl p-3 sm:p-4 border border-amber-200 shadow-sm text-center flex flex-col items-center justify-center space-y-1 hover:shadow-md cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mb-1">
                <Layers className="w-4 h-4" />
              </div>
              <span className="text-base sm:text-lg font-black text-gray-900 leading-none">Live</span>
              <span className="text-[10px] sm:text-xs font-bold text-amber-700">Orders Kanban</span>
            </div>

            <div 
              onClick={() => setActiveView('vendor')}
              className="bg-white rounded-2xl p-3 sm:p-4 border border-amber-200 shadow-sm text-center flex flex-col items-center justify-center space-y-1 hover:shadow-md cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mb-1">
                <UtensilsCrossed className="w-4 h-4" />
              </div>
              <span className="text-base sm:text-lg font-black text-gray-900 leading-none">Menu</span>
              <span className="text-[10px] sm:text-xs font-bold text-amber-700">Items Manager</span>
            </div>

            <div 
              onClick={() => setActiveView('vendor')}
              className="bg-white rounded-2xl p-3 sm:p-4 border border-amber-200 shadow-sm text-center flex flex-col items-center justify-center space-y-1 hover:shadow-md cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mb-1">
                <Bike className="w-4 h-4" />
              </div>
              <span className="text-base sm:text-lg font-black text-gray-900 leading-none">Riders</span>
              <span className="text-[10px] sm:text-xs font-bold text-amber-700">Delivery Roster</span>
            </div>
          </div>
        ) : (
          /* CUSTOMER STAT CARDS */
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            <div className="bg-white rounded-2xl p-3 sm:p-4 border border-gray-200/80 shadow-sm text-center flex flex-col items-center justify-center space-y-1 hover:shadow-md transition-shadow">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mb-1">
                <Star className="w-4 h-4 fill-emerald-600" />
              </div>
              <span className="text-base sm:text-lg font-black text-gray-900 leading-none">0</span>
              <span className="text-[10px] sm:text-xs font-bold text-gray-400">Loyalty Points</span>
            </div>

            <div 
              onClick={() => setActiveView('my-orders')}
              className="bg-white rounded-2xl p-3 sm:p-4 border border-gray-200/80 shadow-sm text-center flex flex-col items-center justify-center space-y-1 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mb-1">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <span className="text-base sm:text-lg font-black text-gray-900 leading-none">{ordersCount}</span>
              <span className="text-[10px] sm:text-xs font-bold text-gray-400">Orders</span>
            </div>

            <div className="bg-white rounded-2xl p-3 sm:p-4 border border-gray-200/80 shadow-sm text-center flex flex-col items-center justify-center space-y-1 hover:shadow-md transition-shadow">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mb-1">
                <Wallet className="w-4 h-4" />
              </div>
              <span className="text-base sm:text-lg font-black text-gray-900 leading-none">₹ 0</span>
              <span className="text-[10px] sm:text-xs font-bold text-gray-400">Wallet Balance</span>
            </div>
          </div>
        )}

        {/* Section: Management / General */}
        <div className="space-y-2">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">
            {isVendor ? 'Vendor Operations' : 'General'}
          </h2>
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden divide-y divide-gray-100">
            
            {isVendor ? (
              <>
                <button 
                  onClick={() => setActiveView('vendor')}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-amber-50/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Layers className="w-4 h-4 text-amber-600" />
                    <span className="text-xs sm:text-sm font-extrabold text-gray-900">Live Orders Kanban Portal</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </button>

                <button 
                  onClick={() => setActiveView('vendor')}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-amber-50/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <UtensilsCrossed className="w-4 h-4 text-amber-600" />
                    <span className="text-xs sm:text-sm font-extrabold text-gray-900">Manage Menu & Food Items</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </button>

                <button 
                  onClick={() => setActiveView('vendor')}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-amber-50/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Bike className="w-4 h-4 text-amber-600" />
                    <span className="text-xs sm:text-sm font-extrabold text-gray-900">Delivery Riders Roster</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => setEditingProfile(true)}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-xs sm:text-sm font-bold text-gray-800">Edit Profile</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </button>

                <button 
                  onClick={() => setEditingProfile(true)}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-xs sm:text-sm font-bold text-gray-800">My Address</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </button>

                <button className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Settings className="w-4 h-4 text-gray-400" />
                    <span className="text-xs sm:text-sm font-bold text-gray-800">Settings</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </button>
              </>
            )}

          </div>
        </div>

        {/* Section: Help & Support */}
        <div className="space-y-2">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">Help & Support</h2>
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden divide-y divide-gray-100">
            
            <button 
              onClick={() => onOpenLegal('Terms & Conditions')}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-gray-400" />
                <span className="text-xs sm:text-sm font-bold text-gray-800">Terms & Conditions</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300" />
            </button>

            <button 
              onClick={() => onOpenLegal('Privacy Policy')}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Shield className="w-4 h-4 text-gray-400" />
                <span className="text-xs sm:text-sm font-bold text-gray-800">Privacy Policy</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300" />
            </button>

          </div>
        </div>

        {/* Logout Button */}
        {user && (
          <button
            onClick={logout}
            className="w-full py-3.5 bg-rose-50 text-rose-600 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 border border-rose-200 hover:bg-rose-100 transition-colors shadow-sm"
          >
            <LogOut className="w-4 h-4" /> Log Out
          </button>
        )}

      </div>

      {/* Edit Profile Modal */}
      {editingProfile && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-lg font-black text-gray-900">Edit Details</h3>
              <button onClick={() => setEditingProfile(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-gray-600 mb-1">Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 rounded-xl border border-gray-200 text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-gray-600 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 rounded-xl border border-gray-200 text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-gray-600 mb-1">Address</label>
                <textarea
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  rows={3}
                  className="w-full p-2.5 bg-gray-50 rounded-xl border border-gray-200 text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              {savedSuccess && (
                <div className="bg-emerald-50 text-emerald-700 p-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border border-emerald-200">
                  <Check className="w-4 h-4 text-emerald-600" /> Details Saved Successfully!
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingProfile(false)}
                  className="w-1/2 py-2.5 rounded-xl text-xs font-extrabold bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl text-xs font-extrabold bg-rose-600 text-white hover:bg-rose-700 shadow-md"
                >
                  Save Details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
