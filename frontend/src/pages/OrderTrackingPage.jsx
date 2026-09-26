import React, { useState, useEffect } from 'react';
import { fetchApi } from '../api/client';
import LiveOrderTracker from '../components/customer/LiveOrderTracker';
import { ShoppingBag, Clock, ChevronRight, CheckCircle2 } from 'lucide-react';

export default function OrderTrackingPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTrackingId, setActiveTrackingId] = useState(null);

  const loadMyOrders = async () => {
    try {
      setLoading(true);
      const res = await fetchApi('/orders/my-orders');
      setOrders(res.data);
      if (res.data && res.data.length > 0) {
        // Default track most recent order if active
        const recent = res.data[0];
        if (['PENDING', 'PREPARING', 'READY', 'DISPATCHED'].includes(recent.status)) {
          setActiveTrackingId(recent.id);
        }
      }
    } catch (err) {
      console.error('Error loading my orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMyOrders();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">My Orders & Live Tracking</h1>
          <p className="text-xs font-semibold text-gray-400">Track real-time delivery status and view order history</p>
        </div>
      </div>

      {/* Active Order Tracker if selected */}
      {activeTrackingId && (
        <LiveOrderTracker
          orderId={activeTrackingId}
          onClose={() => setActiveTrackingId(null)}
        />
      )}

      {/* Order History List */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden p-6 space-y-4">
        <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider">Recent Orders Log</h3>

        {loading ? (
          <div className="py-8 text-center text-xs font-bold text-gray-400">Loading your orders...</div>
        ) : orders.length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-xs font-medium">
            You haven't placed any orders yet.
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((o) => (
              <div
                key={o.id}
                onClick={() => setActiveTrackingId(o.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  activeTrackingId === o.id
                    ? 'border-rose-500 bg-rose-50/40 ring-2 ring-rose-500/20'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={o.restaurant?.imageUrl || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80'}
                    alt={o.restaurant?.name}
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-rose-600 text-sm">{o.orderNumber}</span>
                      <span className="text-[11px] font-bold text-gray-800">{o.restaurant?.name}</span>
                    </div>
                    <div className="text-[11px] font-semibold text-gray-400 flex items-center gap-2 mt-0.5">
                      <span>{new Date(o.createdAt).toLocaleString()}</span>
                      <span>•</span>
                      <span>{o.items.length} items</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4">
                  <div className="text-right">
                    <div className="text-sm font-black text-gray-900">₹{o.total.toFixed(2)}</div>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider mt-0.5 ${
                      o.status === 'DELIVERED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : o.status === 'CANCELLED'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800 animate-pulse'
                    }`}>
                      {o.status}
                    </span>
                  </div>

                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
