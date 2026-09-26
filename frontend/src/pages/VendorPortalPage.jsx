import React, { useState, useEffect } from 'react';
import { fetchApi } from '../api/client';
import { getSocket } from '../api/socket';
import LiveKanbanBoard from '../components/vendor/LiveKanbanBoard';
import MenuManagement from '../components/vendor/MenuManagement';
import RestaurantProfile from '../components/vendor/RestaurantProfile';
import DeliveryPartnerRoster from '../components/vendor/DeliveryPartnerRoster';
import { Store, Download, RefreshCw, Layers, Utensils, Truck, Volume2, VolumeX, BellRing, AlertCircle, Loader2, X } from 'lucide-react';

export default function VendorPortalPage() {
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [activeTab, setActiveTab] = useState('kanban'); // kanban, menu, drivers
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('vendor_sound_enabled');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [newOrderAlert, setNewOrderAlert] = useState(null);

  useEffect(() => {
    localStorage.setItem('vendor_sound_enabled', JSON.stringify(soundEnabled));
  }, [soundEnabled]);

  // Audio Chime Synthesizer using Web Audio API (POS Bell Ring: Ding-Dong! 🔔)
  const playOrderChimeSound = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      // First chime tone (D5 - 587.33 Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, ctx.currentTime);
      gain1.gain.setValueAtTime(0.3, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.6);

      // Second chime tone (A5 - 880 Hz)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.15);
      gain2.gain.setValueAtTime(0.4, ctx.currentTime + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.85);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(ctx.currentTime + 0.15);
      osc2.stop(ctx.currentTime + 0.85);
    } catch (err) {
      console.error('Audio chime error:', err);
    }
  };

  const loadVendorData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [profRes, ordRes, menuRes] = await Promise.all([
        fetchApi('/vendor/profile'),
        fetchApi('/vendor/orders'),
        fetchApi('/vendor/menu')
      ]);
      setProfile(profRes?.data || profRes);
      setOrders(ordRes?.data || ordRes || []);
      setMenuItems(menuRes?.data || menuRes || []);
    } catch (err) {
      console.error('Error loading vendor portal data:', err);
      setError(err.message || 'Failed to load vendor profile and orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVendorData();
  }, []);

  useEffect(() => {
    if (!profile?.id) return;

    const socket = getSocket();
    socket.emit('join_vendor_room', profile.id);

    const handleNewOrder = (newOrder) => {
      setOrders((prev) => [newOrder, ...prev]);

      if (soundEnabled) {
        playOrderChimeSound();
      }

      setNewOrderAlert(newOrder);
      setTimeout(() => {
        setNewOrderAlert(null);
      }, 7000);
    };

    const handleOrderUpdated = (updatedOrder) => {
      setOrders((prev) => prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o)));
    };

    socket.on('new_order', handleNewOrder);
    socket.on('order_updated_vendor', handleOrderUpdated);

    return () => {
      socket.off('new_order', handleNewOrder);
      socket.off('order_updated_vendor', handleOrderUpdated);
    };
  }, [profile?.id, soundEnabled]);

  const handleExportVendorReport = async (format) => {
    try {
      setExporting(true);
      const endpoint = `/vendor/reports/export?format=${format}`;
      
      const blob = await fetchApi(endpoint, { responseType: 'blob' });
      const fileName = `vendor_earnings_${format}_${Date.now()}.${format}`;
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', fileName);
      link.setAttribute('target', '_blank');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => {
        window.URL.revokeObjectURL(blobUrl);
      }, 15000);
    } catch (err) {
      alert('Error exporting vendor report: ' + err.message);
    } finally {
      setExporting(false);
    }
  };

  if (loading && !profile) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center font-bold text-gray-500 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
        <span className="text-sm">Connecting to Vendor Live Portal...</span>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-gray-200 text-center space-y-4 shadow-sm">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h3 className="text-lg font-black text-gray-900">Vendor Portal Error</h3>
        <p className="text-xs font-semibold text-gray-500">{error}</p>
        <button
          onClick={loadVendorData}
          className="px-5 py-2.5 bg-amber-600 text-white rounded-xl text-xs font-black shadow-md hover:bg-amber-700"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 relative">
      
      {/* Real-time New Order Popup Banner with Sound */}
      {newOrderAlert && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-4 rounded-3xl shadow-2xl border-2 border-emerald-400 animate-in slide-in-from-top-5 duration-300 max-w-md w-full flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold text-white shadow-inner animate-bounce">
              <BellRing className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-amber-300 text-emerald-950 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                  ⚡ NEW ORDER
                </span>
                <span className="text-xs font-black text-emerald-200">#{newOrderAlert.orderNumber || newOrderAlert.id}</span>
              </div>
              <h4 className="text-sm font-extrabold mt-0.5 text-white">{newOrderAlert.customer?.name || 'Customer Order'}</h4>
              <p className="text-xs font-bold text-emerald-100">
                Total: ₹{(newOrderAlert.total || 0).toFixed(2)} • {newOrderAlert.items?.length || 1} items
              </p>
            </div>
          </div>

          <button
            onClick={() => setNewOrderAlert(null)}
            className="p-1.5 text-emerald-200 hover:text-white rounded-xl hover:bg-emerald-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-amber-600 via-rose-600 to-amber-700 p-6 rounded-3xl text-white shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center font-bold text-white border border-white/20">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black">{profile?.name || 'Vendor Portal'}</h1>
            <p className="text-xs font-semibold text-rose-100">
              Live Order Kanban Board, Driver Roster & Menu Item Catalog
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Order Alert Sound Chime Controls */}
          <button
            onClick={playOrderChimeSound}
            className="px-3 py-2 bg-white/10 hover:bg-white/20 text-amber-200 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all border border-white/20"
            title="Click to test new order chime sound"
          >
            <BellRing className="w-4 h-4 text-amber-300" />
            <span>Test Sound</span>
          </button>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`px-3 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all border ${
              soundEnabled
                ? 'bg-emerald-500/30 text-emerald-200 border-emerald-400/50'
                : 'bg-rose-950/40 text-rose-300 border-rose-500/50'
            }`}
            title="Toggle Order Sound Notification"
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-4 h-4 text-emerald-300" />
                <span>Chime: ON</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4 text-rose-400" />
                <span>Chime: MUTED</span>
              </>
            )}
          </button>

          <button
            onClick={loadVendorData}
            className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => handleExportVendorReport('csv')}
            disabled={exporting}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all border border-white/20 disabled:opacity-50"
          >
            <Download className="w-4 h-4" /> Download Earnings CSV
          </button>

          <button
            onClick={() => handleExportVendorReport('pdf')}
            disabled={exporting}
            className="px-4 py-2.5 bg-white text-gray-900 hover:bg-gray-100 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md transition-all active:scale-95 disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-rose-600" /> Export PDF Log
          </button>
        </div>
      </div>

      {/* Profile Bar */}
      {profile && <RestaurantProfile profile={profile} onRefresh={loadVendorData} />}

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-3 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('kanban')}
          className={`px-4 sm:px-5 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'kanban'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <Layers className="w-4 h-4" /> Live Order Board (Kanban)
        </button>

        <button
          onClick={() => setActiveTab('menu')}
          className={`px-4 sm:px-5 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'menu'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <Utensils className="w-4 h-4" /> Menu Catalog ({menuItems.length})
        </button>

        <button
          onClick={() => setActiveTab('drivers')}
          className={`px-4 sm:px-5 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'drivers'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <Truck className="w-4 h-4" /> Delivery Drivers Roster
        </button>
      </div>

      {/* Main Tab Views */}
      {activeTab === 'kanban' ? (
        <LiveKanbanBoard orders={orders} onStatusUpdate={loadVendorData} />
      ) : activeTab === 'menu' ? (
        <MenuManagement menuItems={menuItems} onRefresh={loadVendorData} />
      ) : (
        <DeliveryPartnerRoster />
      )}
    </div>
  );
}
