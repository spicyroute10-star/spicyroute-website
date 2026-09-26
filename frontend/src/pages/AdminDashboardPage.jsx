import React, { useState, useEffect } from 'react';
import { fetchApi } from '../api/client';
import { getSocket } from '../api/socket';
import MetricsGrid from '../components/admin/MetricsGrid';
import RestaurantPerformanceTable from '../components/admin/RestaurantPerformanceTable';
import ReportDownloaderModal from '../components/admin/ReportDownloaderModal';
import VendorOnboardingModal from '../components/admin/VendorOnboardingModal';
import { Download, UserPlus, RefreshCw, Settings, ShieldAlert, Sparkles } from 'lucide-react';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [distribution, setDistribution] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [globalCommissionRate, setGlobalCommissionRate] = useState('15');
  const [updatingCommission, setUpdatingCommission] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsRes, distRes] = await Promise.all([
        fetchApi('/admin/dashboard-stats'),
        fetchApi('/admin/orders-by-restaurant')
      ]);
      setStats(statsRes.data);
      setDistribution(distRes.data);
      if (statsRes.data?.globalCommissionRate) {
        setGlobalCommissionRate(statsRes.data.globalCommissionRate.toString());
      }
    } catch (err) {
      console.error('Error loading admin analytics:', err);
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

      {/* Global Commission Setting Banner */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-gray-900">Global Platform Commission Control</h3>
            <p className="text-xs font-medium text-gray-500">
              Default commission percentage automatically applied to newly onboarded vendors
            </p>
          </div>
        </div>

        <form onSubmit={handleUpdateGlobalCommission} className="flex items-center gap-2">
          <div className="relative">
            <input
              type="number"
              step="0.5"
              required
              value={globalCommissionRate}
              onChange={(e) => setGlobalCommissionRate(e.target.value)}
              className="w-24 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-black text-center focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">%</span>
          </div>
          <button
            type="submit"
            disabled={updatingCommission}
            className="bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm"
          >
            {updatingCommission ? 'Updating...' : 'Save Global Rate'}
          </button>
        </form>
      </div>

      {/* KPI Metrics Grid */}
      <MetricsGrid stats={stats} />

      {/* Restaurant Performance & Order Distribution Table */}
      <RestaurantPerformanceTable distribution={distribution} onRefresh={loadData} />

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
