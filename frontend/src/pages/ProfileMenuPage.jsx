import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  User, Star, ShoppingBag, Wallet, Sun, Moon, 
  MapPin, Settings, Ticket, UserCheck, Store, 
  FileText, Shield, ChevronRight, LogOut, Layers, UtensilsCrossed, Bike, Check, X, Smartphone,
  RefreshCw, Building2, Trash2, AlertTriangle
} from 'lucide-react';
import { usePwaInstall } from '../context/PwaInstallContext';

export default function ProfileMenuPage({ onOpenLegal, setActiveView, ordersCount = 2 }) {
  const { user, logout, deleteAccount } = useAuth();
  const { triggerInstall, isInstalled } = usePwaInstall();
  const isVendor = user?.role === 'VENDOR';
  const isAdmin = user?.role === 'ADMIN' || (user?.email && user.email.toLowerCase() === 'spicyroute10@gmail.com');

  const [darkMode, setDarkMode] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [editName, setEditName] = useState(user?.name || 'Restaurant Owner');
  const [editPhone, setEditPhone] = useState(user?.phone || '+91 98123 45678');
  const [editAddress, setEditAddress] = useState(user?.address || 'Restaurant Address');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Delete Account States
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [deleteError, setDeleteError] = useState('');

  const handleDeleteAccount = async () => {
    if (deleteConfirmation.trim().toUpperCase() !== 'DELETE') {
      setDeleteError("Please type DELETE to confirm account removal.");
      return;
    }
    setDeleteError('');
    setIsDeleting(true);
    try {
      const res = await deleteAccount();
      if (!res.success) {
        setDeleteError(res.error || "Failed to delete account. Please try again.");
        setIsDeleting(false);
      } else {
        setShowDeleteModal(false);
        if (setActiveView) setActiveView('home');
      }
    } catch (err) {
      setDeleteError(err.message || "An unexpected error occurred.");
      setIsDeleting(false);
    }
  };

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
        isAdmin
          ? 'bg-gradient-to-r from-purple-800 via-indigo-900 to-slate-900'
          : isVendor 
            ? 'bg-gradient-to-r from-amber-600 via-amber-500 to-rose-600' 
            : 'bg-gradient-to-r from-red-600 via-rose-600 to-rose-700'
      }`}>
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Avatar Circle */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/20 backdrop-blur-md border-2 border-white/40 flex items-center justify-center text-white shadow-md">
              {isAdmin ? <Shield className="w-9 h-9 sm:w-11 sm:h-11 text-white" /> : isVendor ? <Store className="w-9 h-9 sm:w-11 sm:h-11 text-white" /> : <User className="w-9 h-9 sm:w-11 sm:h-11 text-white" />}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight">{user?.name || editName}</h1>
                <span className="bg-white/20 backdrop-blur-md text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border border-white/30 text-amber-100">
                  {isAdmin ? 'Super Admin' : isVendor ? 'Vendor' : 'Customer'}
                </span>
              </div>
              <p className="text-xs font-semibold text-white/80 mt-0.5">
                {isAdmin ? 'Platform Executive Administrator' : isVendor ? 'Verified Restaurant Partner' : 'Joined 08 Sep, 2026'}
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
        
        {/* Admin Executive Dashboard Banner */}
        {isAdmin && (
          <div 
            onClick={() => setActiveView('admin')}
            className="bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 text-white rounded-2xl p-5 shadow-lg flex items-center justify-between cursor-pointer hover:shadow-xl transition-all border border-purple-400/30 group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-black">Super Admin Executive Dashboard</h3>
                <p className="text-xs text-purple-200">View real-time GMV, vendor controls, and export financial reports</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-purple-200 group-hover:translate-x-1 transition-transform" />
          </div>
        )}

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

            {/* Permanent PWA Add to Home Screen Option */}
            <button 
              onClick={triggerInstall}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-rose-50/50 transition-colors group bg-gradient-to-r from-rose-50/20 to-transparent"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-extrabold text-gray-900">
                      {isInstalled ? 'App Active on Device' : '📱 Add App to Home Screen'}
                    </span>
                    <span className="bg-rose-100 text-rose-700 text-[10px] font-black px-2 py-0.5 rounded-full">
                      {isInstalled ? 'Installed' : 'Fast Order'}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 font-semibold mt-0.5">
                    {isInstalled ? 'Running in full-screen standalone app mode' : 'Order in 1 tap without typing URL in browser'}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-rose-600 transition-colors" />
            </button>

          </div>
        </div>

        {/* Section: Help & Support */}
        <div className="space-y-2">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">Legal & Compliance</h2>
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

            <button 
              onClick={() => onOpenLegal('Cancellation & Refund')}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <RefreshCw className="w-4 h-4 text-gray-400" />
                <span className="text-xs sm:text-sm font-bold text-gray-800">Cancellation & Refund Policy</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300" />
            </button>

            <button 
              onClick={() => onOpenLegal('FSSAI & Compliance')}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Building2 className="w-4 h-4 text-gray-400" />
                <span className="text-xs sm:text-sm font-bold text-gray-800">FSSAI Standards & Grievance</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300" />
            </button>

          </div>
        </div>

        {/* Action Buttons: Logout & Delete Account */}
        {user && (
          <div className="space-y-3 pt-2">
            <button
              onClick={logout}
              className="w-full py-3.5 bg-rose-50 text-rose-600 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 border border-rose-200 hover:bg-rose-100 transition-colors shadow-sm"
            >
              <LogOut className="w-4 h-4" /> Log Out
            </button>

            {/* Permanent Account Deletion */}
            <div className="p-4 bg-red-50/50 rounded-2xl border border-red-100 text-center space-y-2">
              <p className="text-[11px] font-semibold text-gray-500">
                Want to permanently remove your Spicy Route account and associated data?
              </p>
              <button
                onClick={() => {
                  setDeleteConfirmation('');
                  setDeleteError('');
                  setShowDeleteModal(true);
                }}
                className="text-xs font-black text-red-600 hover:text-red-700 hover:underline flex items-center justify-center gap-1.5 mx-auto transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete My Account
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200 border border-red-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-gray-900">Delete Account Permanently</h3>
                <p className="text-xs text-gray-500">This action is irreversible and permanent.</p>
              </div>
            </div>

            <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-1.5 leading-relaxed font-medium">
              <p className="font-bold">By proceeding, you understand that:</p>
              <ul className="list-disc pl-4 space-y-1 text-[11px] text-amber-800">
                <li>Your profile details, delivery addresses, and login credentials will be erased.</li>
                {isVendor && <li>Your registered restaurant, menu listings, and active vendor sessions will be wiped.</li>}
                <li>All order history, reviews, and coupon usages will be permanently detached.</li>
              </ul>
            </div>

            {deleteError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-700 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{deleteError}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-xs font-extrabold text-gray-700">
                To confirm, type <span className="font-black text-red-600 tracking-wider">DELETE</span> below:
              </label>
              <input
                type="text"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder="DELETE"
                className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs font-black tracking-widest uppercase text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setShowDeleteModal(false)}
                className="w-1/2 py-3 rounded-xl text-xs font-extrabold bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting || deleteConfirmation.trim().toUpperCase() !== 'DELETE'}
                onClick={handleDeleteAccount}
                className="w-1/2 py-3 rounded-xl text-xs font-extrabold bg-red-600 text-white hover:bg-red-700 disabled:opacity-40 disabled:hover:bg-red-600 shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" /> Confirm Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

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
