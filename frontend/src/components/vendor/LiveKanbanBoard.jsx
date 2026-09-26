import React, { useState } from 'react';
import { Clock, CheckCircle2, ChevronRight, Phone, MapPin, Truck, Bike } from 'lucide-react';
import { fetchApi } from '../../api/client';
import DeliveryPartnerModal from './DeliveryPartnerModal';

export default function LiveKanbanBoard({ orders = [], onStatusUpdate }) {
  const [dispatchModalOrder, setDispatchModalOrder] = useState(null);

  const stages = [
    { key: 'PENDING', label: 'Pending Approval', color: 'border-amber-500 bg-amber-50/50 text-amber-800', nextStatus: 'PREPARING', nextLabel: 'Accept & Cook' },
    { key: 'PREPARING', label: 'Kitchen Preparing', color: 'border-blue-500 bg-blue-50/50 text-blue-800', nextStatus: 'READY', nextLabel: 'Mark Ready' },
    { key: 'READY', label: 'Ready for Pickup', color: 'border-purple-500 bg-purple-50/50 text-purple-800', nextStatus: 'DISPATCHED', nextLabel: 'Dispatch Driver' },
    { key: 'DISPATCHED', label: 'Out for Delivery', color: 'border-indigo-500 bg-indigo-50/50 text-indigo-800', nextStatus: 'DELIVERED', nextLabel: 'Mark Delivered' },
    { key: 'DELIVERED', label: 'Completed', color: 'border-emerald-500 bg-emerald-50/50 text-emerald-800', nextStatus: null, nextLabel: null }
  ];

  const handleAdvanceStatus = async (order, nextStatus) => {
    if (nextStatus === 'DISPATCHED') {
      setDispatchModalOrder(order);
      return;
    }

    try {
      await fetchApi(`/vendor/orders/${order.id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: nextStatus })
      });
      if (onStatusUpdate) onStatusUpdate();
    } catch (err) {
      alert('Error updating order status: ' + err.message);
    }
  };

  const handleConfirmDispatch = async (driverDetails) => {
    if (!dispatchModalOrder) return;
    try {
      await fetchApi(`/vendor/orders/${dispatchModalOrder.id}/status`, {
        method: 'PUT',
        body: JSON.stringify({
          status: 'DISPATCHED',
          ...driverDetails
        })
      });
      setDispatchModalOrder(null);
      if (onStatusUpdate) onStatusUpdate();
    } catch (err) {
      alert('Error dispatching driver: ' + err.message);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      await fetchApi(`/vendor/orders/${orderId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'CANCELLED' })
      });
      if (onStatusUpdate) onStatusUpdate();
    } catch (err) {
      alert('Error cancelling order: ' + err.message);
    }
  };

  return (
    <>
      {/* Mobile Touch Swipe Indicator */}
      <div className="md:hidden text-[11px] font-bold text-gray-400 flex items-center justify-between mb-2 px-1">
        <span>← Swipe horizontally between stages</span>
        <span>{orders.length} total orders</span>
      </div>

      <div className="flex md:grid md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 overflow-x-auto pb-6 snap-x snap-mandatory">
        {stages.map((stage) => {
          const columnOrders = orders.filter((o) => o.status === stage.key);

          return (
            <div 
              key={stage.key} 
              className="bg-gray-100/70 rounded-2xl p-3 sm:p-4 border border-gray-200 flex flex-col min-h-[460px] min-w-[280px] sm:min-w-0 snap-center flex-shrink-0 md:flex-shrink"
            >
              {/* Column Header */}
              <div className={`p-2.5 sm:p-3 rounded-xl border-l-4 font-extrabold text-xs uppercase tracking-wider mb-3 flex items-center justify-between ${stage.color}`}>
                <span className="truncate">{stage.label}</span>
                <span className="bg-white/90 px-2 py-0.5 rounded-full text-[11px] font-black shadow-xs flex-shrink-0">
                  {columnOrders.length}
                </span>
              </div>

              {/* Column Order Cards */}
              <div className="space-y-3 flex-1 overflow-y-auto pr-0.5">
                {columnOrders.length === 0 ? (
                  <div className="text-center py-12 text-gray-400 text-xs font-semibold">
                    No orders in this stage
                  </div>
                ) : (
                  columnOrders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-white rounded-2xl p-3.5 border border-gray-200 shadow-xs hover:shadow-md transition-all space-y-2.5"
                    >
                      {/* Top Row */}
                      <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                        <span className="font-black text-rose-600 text-xs sm:text-sm">{order.orderNumber}</span>
                        <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      {/* Customer Info */}
                      <div>
                        <div className="text-xs font-extrabold text-gray-800">{order.customer?.name}</div>
                        <div className="text-[11px] font-semibold text-gray-500 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-gray-400" />
                          {order.customerPhone || order.customer?.phone}
                        </div>
                        <div className="text-[11px] font-semibold text-gray-500 flex items-center gap-1 mt-0.5 truncate">
                          <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
                          <span className="truncate">{order.deliveryAddress}</span>
                        </div>
                      </div>

                      {/* Driver Badge */}
                      {(order.deliveryPartnerName || order.deliveryPartner) && (
                        <div className="bg-indigo-50 border border-indigo-200 p-2 rounded-xl text-xs font-semibold text-indigo-900 flex items-center gap-2">
                          <Bike className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                          <div className="min-w-0">
                            <div className="font-black text-[11px] truncate">{order.deliveryPartnerName || order.deliveryPartner?.name}</div>
                            <div className="text-[10px] text-indigo-600 font-bold">{order.deliveryPartnerPhone || order.deliveryPartner?.phone}</div>
                          </div>
                        </div>
                      )}

                      {/* Item List */}
                      <div className="bg-gray-50 p-2 rounded-xl space-y-1">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex justify-between text-xs font-semibold text-gray-700">
                            <span className="truncate max-w-[170px]">
                              <strong className="text-rose-600 font-extrabold">{item.quantity}x</strong> {item.name}
                            </span>
                            <span className="text-gray-400 flex-shrink-0">₹{(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>

                      {/* Summary & Action */}
                      <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                        <div>
                          <span className="text-[10px] font-bold text-gray-400 uppercase">Vendor Net</span>
                          <div className="text-xs sm:text-sm font-black text-gray-900">₹{order.vendorEarnings.toFixed(2)}</div>
                        </div>

                        {stage.nextStatus ? (
                          <div className="flex items-center gap-1">
                            {stage.key === 'PENDING' && (
                              <button
                                onClick={() => handleCancelOrder(order.id)}
                                className="px-2 py-1 text-[10px] font-bold text-rose-600 hover:bg-rose-50 rounded-lg"
                              >
                                Reject
                              </button>
                            )}
                            <button
                              onClick={() => handleAdvanceStatus(order, stage.nextStatus)}
                              className="bg-rose-600 hover:bg-rose-700 text-white px-2.5 py-1.5 rounded-xl text-[11px] font-extrabold flex items-center gap-0.5 shadow-xs transition-transform active:scale-95"
                            >
                              <span>{stage.nextLabel}</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Complete
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      <DeliveryPartnerModal
        isOpen={!!dispatchModalOrder}
        order={dispatchModalOrder}
        onClose={() => setDispatchModalOrder(null)}
        onConfirm={handleConfirmDispatch}
      />
    </>
  );
}
