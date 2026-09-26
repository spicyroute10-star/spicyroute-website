import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle2, Truck, Store, Utensils, MapPin, Sparkles, Phone, UserCheck, Bike } from 'lucide-react';
import { getSocket } from '../../api/socket';
import { fetchApi } from '../../api/client';

export default function LiveOrderTracker({ orderId, onClose }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;

    fetchApi(`/orders/${orderId}`)
      .then((res) => {
        setOrder(res.data);
      })
      .catch((err) => {
        console.error('Error fetching order for tracking:', err);
      })
      .finally(() => setLoading(false));

    const socket = getSocket();
    socket.emit('join_order_room', orderId);

    const handleStatusChanged = (updatedOrder) => {
      if (updatedOrder.id === parseInt(orderId, 10)) {
        setOrder(updatedOrder);
      }
    };

    socket.on('order_status_changed', handleStatusChanged);

    return () => {
      socket.off('order_status_changed', handleStatusChanged);
    };
  }, [orderId]);

  if (!orderId) return null;
  if (loading || !order) {
    return (
      <div className="bg-white p-8 rounded-3xl text-center font-bold text-gray-500 shadow-md">
        Connecting live tracker...
      </div>
    );
  }

  const steps = [
    { key: 'PENDING', label: 'Order Received', icon: Clock, desc: 'Sent to restaurant kitchen' },
    { key: 'PREPARING', label: 'Cooking & Preparing', icon: Utensils, desc: 'Chef is crafting your meal' },
    { key: 'READY', label: 'Packed & Ready', icon: Store, desc: 'Awaiting delivery driver' },
    { key: 'DISPATCHED', label: 'Out for Delivery', icon: Truck, desc: 'Driver is on the way to you' },
    { key: 'DELIVERED', label: 'Delivered!', icon: CheckCircle2, desc: 'Enjoy your meal!' }
  ];

  const getStepStatus = (stepKey) => {
    if (order.status === 'CANCELLED') return 'cancelled';
    const currentIdx = steps.findIndex((s) => s.key === order.status);
    const stepIdx = steps.findIndex((s) => s.key === stepKey);

    if (stepIdx < currentIdx) return 'completed';
    if (stepIdx === currentIdx) return 'active';
    return 'upcoming';
  };

  const hasDriver = order.deliveryPartnerName || order.deliveryPartner;
  const driverName = order.deliveryPartnerName || order.deliveryPartner?.name;
  const driverPhone = order.deliveryPartnerPhone || order.deliveryPartner?.phone;
  const driverVehicle = order.deliveryPartnerVehicle || order.deliveryPartner?.vehicleNumber;

  return (
    <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xl max-w-2xl mx-auto my-6 relative overflow-hidden space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-black text-rose-600 text-lg">{order.orderNumber}</span>
            <span className="bg-rose-100 text-rose-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-rose-600 animate-spin" /> Live WebSockets
            </span>
          </div>
          <p className="text-xs font-semibold text-gray-400 mt-0.5">
            Placed at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {order.restaurant?.name}
          </p>
        </div>

        {onClose && (
          <button onClick={onClose} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl">
            Close Tracker
          </button>
        )}
      </div>

      {/* Cancelled Banner if cancelled */}
      {order.status === 'CANCELLED' ? (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-center font-bold text-sm">
          ❌ This order was cancelled by the restaurant.
        </div>
      ) : (
        /* Visual Timeline Progress Bar */
        <div className="py-4 px-2">
          <div className="relative flex items-center justify-between">
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-gray-200 z-0"></div>

            {steps.map((step) => {
              const status = getStepStatus(step.key);
              const Icon = step.icon;

              let iconBg = 'bg-gray-200 text-gray-400 border-gray-300';
              if (status === 'completed') iconBg = 'bg-emerald-600 text-white border-emerald-600';
              if (status === 'active') iconBg = 'bg-rose-600 text-white border-rose-600 ring-4 ring-rose-100 animate-pulse';

              return (
                <div key={step.key} className="relative z-10 flex flex-col items-center group">
                  <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold shadow-md transition-all ${iconBg}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="text-center mt-2">
                    <div className={`text-xs font-extrabold ${status === 'active' ? 'text-rose-600' : 'text-gray-800'}`}>
                      {step.label}
                    </div>
                    <div className="text-[10px] font-medium text-gray-400 max-w-[90px] hidden sm:block">
                      {step.desc}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Assigned Delivery Driver Details Card */}
      {hasDriver && ['DISPATCHED', 'DELIVERED'].includes(order.status) && (
        <div className="bg-gradient-to-r from-indigo-900 to-slate-900 p-5 rounded-2xl text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-indigo-700/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/50 border border-indigo-400 flex items-center justify-center font-bold text-white shadow-inner">
              <Bike className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-300 flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" /> Assigned Delivery Partner
              </div>
              <div className="text-base font-black text-white mt-0.5">{driverName}</div>
              <div className="text-xs font-semibold text-indigo-200">{driverVehicle || 'Express Courier Rider'}</div>
            </div>
          </div>

          <a
            href={`tel:${driverPhone}`}
            className="w-full sm:w-auto px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
          >
            <Phone className="w-4 h-4" />
            <span>Call Driver ({driverPhone})</span>
          </a>
        </div>
      )}

      {/* Order Summary Footer */}
      <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <div className="text-xs font-bold text-gray-500 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-rose-600" /> Delivery Address
          </div>
          <div className="text-xs font-extrabold text-gray-900 mt-0.5">{order.deliveryAddress}</div>
        </div>

        <div className="text-right">
          <div className="text-[10px] font-bold text-gray-400 uppercase">Total Charged</div>
          <div className="text-lg font-black text-rose-600">₹{order.total.toFixed(2)}</div>
        </div>
      </div>
    </div>
  );
}
