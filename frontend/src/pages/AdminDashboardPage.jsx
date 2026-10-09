import React, { useState, useEffect } from 'react';
import { fetchApi } from '../api/client';
import { getSocket } from '../api/socket';
import MetricsGrid from '../components/admin/MetricsGrid';
import RestaurantPerformanceTable from '../components/admin/RestaurantPerformanceTable';
import ReportDownloaderModal from '../components/admin/ReportDownloaderModal';
import VendorOnboardingModal from '../components/admin/VendorOnboardingModal';
import { Download, UserPlus, RefreshCw, Settings, ShieldAlert, Sparkles, Loader2, CheckCircle, Store, Clock, BellRing, Trash2 } from 'lucide-react';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [distribution, setDistribution] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [globalCommissionRate, setGlobalCommissionRate] = useState('15');
  const [updatingCommission, setUpdatingCommission] = useState(false);

  const pendingVendors = distribution.filter(r => r.isApproved === false || r.is_approved === false);

  const handleApproveVendor = async (restaurantId, restaurantName) => {
    try {
      // Optimistic update
      setDistribution(prev => (Array.isArray(prev) ? prev.map(r => ((r.restaurantId || r.id) === restaurantId ? { ...r, isApproved: true, is_approved: true } : r)) : []));

      await fetchApi(`/admin/restaurants/${restaurantId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ isApproved: true })
      });
      alert(`✅ "${restaurantName}" is now approved and live on the Customer Storefront!`);
      loadData();
    } catch (err) {
      alert('Error approving vendor: ' + err.message);
      loadData();
    }
  };

  const handleRejectVendor = async (restaurantId, restaurantName) => {
    if (!window.confirm(`Are you sure you want to reject and delete "${restaurantName}"? This will permanently delete the restaurant.`)) return;
    try {
      // Optimistically remove from state so the card vanishes immediately
      setDistribution(prev => (Array.isArray(prev) ? prev.filter(r => (r.restaurantId || r.id) !== restaurantId) : []));

      await fetchApi(`/admin/restaurants/${restaurantId}`, {
        method: 'DELETE'
      });
      alert(`🗑️ "${restaurantName}" has been rejected and deleted.`);
      loadData();
    } catch (err) {
      alert('Error deleting vendor: ' + err.message);
      loadData();
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsRes, distRes] = await Promise.all([
        fetchApi('/admin/dashboard-stats').catch(e => ({ data: null })),
        fetchApi('/admin/orders-by-restaurant').catch(e => ({ data: [] }))
      ]);
      setStats(statsRes?.data || {
        totalGMV: 0,
        totalVendorPayouts: 0,
        totalCommission: 0,
        globalCommissionRate: 15,
        totalOrders: 0,
        activeOrdersCount: 0,
        activeRestaurants: 0,
        totalRestaurants: 0,
        conversionRate: 0
      });
      setDistribution(Array.isArray(distRes?.data) ? distRes.data : []);
      if (statsRes?.data?.globalCommissionRate) {
        setGlobalCommissionRate(statsRes.data.globalCommissionRate.toString());
      }
    } catch (err) {
      console.error('Error loading admin analytics:', err);
      setStats(prev => prev || {
        totalGMV: 0,
        totalVendorPayouts: 0,
        totalCommission: 0,
        globalCommissionRate: 15,
        totalOrders: 0,
        activeOrdersCount: 0,
        activeRestaurants: 0,
        totalRestaurants: 0,
        conversionRate: 0
      });
      setDistribution(prev => prev || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Connect WebSockets for real-time admin order count updates
    const socket = getSocket();
    socket.emit('join_admin_room');

    const handleRealtimeUpdate = () => {
      loadData();
    };

    socket.on('order_created_admin', handleRealtimeUpdate);
    socket.on('order_updated_admin', handleRealtimeUpdate);

    return () => {
      socket.off('order_created_admin', handleRealtimeUpdate);
      socket.off('order_updated_admin', handleRealtimeUpdate);
    };
  }, []);

  const handleUpdateGlobalCommission = async (e) => {
    e.preventDefault();
    try {
      setUpdatingCommission(true);
      await fetchApi('/admin/settings/commission', {
        method: 'PUT',
        body: JSON.stringify({ commissionRate: globalCommissionRate })
      });
      alert('Global platform commission rate updated!');
      loadData();
    } catch (err) {
      alert('Error setting global commission: ' + err.message);
    } finally {
      setUpdatingCommission(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Dashboard Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 p-6 rounded-3xl text-white shadow-xl border border-rose-900/30">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-rose-400" />
            <h1 className="text-2xl font-black tracking-tight">Super Admin Executive Dashboard</h1>
          </div>
          <p className="text-xs font-semibold text-rose-200/80 mt-1">
            Global Revenue GMV, Platform Commissions, Restaurant Order Distributions & Automated Reports
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Refresh Button */}
          <button
            onClick={loadData}
            className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {/* Onboard Vendor */}
          <button
            onClick={() => setIsOnboardingOpen(true)}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all border border-white/10"
          >
            <UserPlus className="w-4 h-4 text-rose-400" /> Onboard Vendor
          </button>

          {/* Report Generator Trigger */}
          <button
            onClick={() => setIsReportModalOpen(true)}
            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black flex items-center gap-2 shadow-lg shadow-rose-600/30 transition-all active:scale-95"
          >
            <Download className="w-4 h-4" /> Export Reports (PDF / CSV)
          </button>
        </div>
      </div>

      {/* Pending Vendor Verification Requests Banner */}
      {pendingVendors.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-rose-500/10 rounded-3xl border-2 border-amber-300 p-6 shadow-md space-y-4 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-md shadow-amber-500/30">
                <Store className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                  <span>Pending Vendor Verification Requests</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-200 text-amber-900 animate-bounce">
                    {pendingVendors.length} WAITING FOR APPROVAL
                  </span>
                </h3>
                <p className="text-xs font-semibold text-gray-500 mt-0.5">
                  These restaurants signed up and will NOT appear on the customer storefront until you accept them below.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
            {pendingVendors.map((vendor) => (
              <div
                key={vendor.restaurantId}
                className="bg-white rounded-2xl p-4.5 border border-amber-200 shadow-sm flex flex-col justify-between space-y-3 hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-extrabold text-sm text-gray-900 leading-snug">
                      {vendor.restaurantName}
                    </h4>
                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-200">
                      Pending
                    </span>
                  </div>
                  <p className="text-[11px] font-bold text-rose-600 mt-0.5">
                    {vendor.cuisine || 'Multi-Cuisine'}
                  </p>
                  
                  <div className="mt-2.5 pt-2.5 border-t border-gray-100 text-xs text-gray-600 space-y-1">
                    <p className="flex items-center gap-1.5 font-semibold text-[11px]">
                      <span className="text-gray-400">Owner:</span> {vendor.ownerName}
                    </p>
                    <p className="flex items-center gap-1.5 font-semibold text-[11px] truncate">
                      <span className="text-gray-400">Email:</span> {vendor.ownerEmail}
                    </p>
                    {vendor.phone && (
                      <p className="flex items-center gap-1.5 font-semibold text-[11px]">
                        <span className="text-gray-400">Phone:</span> {vendor.phone}
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-100 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleApproveVendor(vendor.restaurantId, vendor.restaurantName)}
                    className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Accept & Make Live</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRejectVendor(vendor.restaurantId, vendor.restaurantName)}
                    className="py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs rounded-xl transition-all flex items-center gap-1 cursor-pointer border border-rose-200"
                    title="Reject and Permanently Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Platform Pricing & Commission Policy Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-rose-500/5 to-amber-500/10 rounded-2xl border border-amber-300/80 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-gray-900">Active Business Model: Fixed ₹5 Application Charges / Item</h3>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-200">
                0% Vendor Commission
              </span>
            </div>
            <p className="text-xs font-medium text-gray-500 mt-0.5">
              Restaurant menu prices are 100% untouched. Vendors receive 100% of their food sales. Platform charges customers ₹5 per item ordered as Application Charges.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-800 shadow-xs">
            <span className="text-gray-400">Application Fee:</span>
            <span className="text-rose-600 font-extrabold">₹5 / Item</span>
          </div>
          <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-800 shadow-xs">
            <span className="text-gray-400">Delivery Fee:</span>
            <span className="text-emerald-700 font-extrabold">Configured per Restaurant</span>
          </div>
        </div>
      </div>

      {/* KPI Metrics Grid & Restaurant Distribution Table */}
      {loading && !stats ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3 bg-white rounded-3xl border border-gray-100">
          <Loader2 className="w-8 h-8 animate-spin text-rose-600" />
          <p className="text-xs font-bold text-gray-400">Loading admin metrics & distributions...</p>
        </div>
      ) : (
        <>
          <MetricsGrid stats={stats} />
          <RestaurantPerformanceTable distribution={distribution} onRefresh={loadData} />
        </>
      )}

      {/* Modals */}
      <ReportDownloaderModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        restaurants={distribution}
      />

      <VendorOnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onSuccess={loadData}
      />
    </div>
  );
}
