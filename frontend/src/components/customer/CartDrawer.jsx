import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, MapPin, Phone, FileText, Navigation, CheckCircle2, ShieldAlert, LogIn } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { fetchApi } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export default function CartDrawer({ isOpen, onClose, onOrderPlaced, onRequireLogin }) {
  const { cartItems, restaurant, updateQuantity, removeFromCart, clearCart, subtotal, deliveryFee, tax, total } = useCart();
  const { user } = useAuth();

  const isVendor = user?.role === 'VENDOR';
  const isAdmin = user?.role === 'ADMIN';
  const isLoggedIn = !!user;

  const [deliveryAddress, setDeliveryAddress] = useState(user?.address || 'Hitec City, Hyderabad');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '+91 98000 00000');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [gpsSuccess, setGpsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser or device');
      return;
    }

    setLocating(true);
    setGpsSuccess(false);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const formattedAddress = `Current GPS Pin (${latitude.toFixed(4)}, ${longitude.toFixed(4)}) - Near ${restaurant?.name || 'Local Area'}`;
        setDeliveryAddress(formattedAddress);
        setLocating(false);
        setGpsSuccess(true);
        setTimeout(() => setGpsSuccess(false), 3000);
      },
      (error) => {
        setLocating(false);
        alert('Could not retrieve GPS location: ' + error.message);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) return;

    if (!isLoggedIn) {
      onClose();
      if (onRequireLogin) onRequireLogin();
      return;
    }

    if (isVendor) {
      alert('Vendor accounts cannot place food orders. Please sign in with a Customer account to order.');
      return;
    }

    try {
      setLoading(true);
      const res = await fetchApi('/orders', {
        method: 'POST',
        body: JSON.stringify({
          restaurantId: restaurant.id,
          items: cartItems.map((i) => ({ menuItemId: i.menuItemId, quantity: i.quantity })),
          deliveryAddress,
          customerPhone,
          notes
        })
      });

      clearCart();
      onClose();
      if (onOrderPlaced) onOrderPlaced(res.data);
    } catch (err) {
      alert('Failed to place order: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white max-w-md w-full h-full shadow-2xl flex flex-col justify-between overflow-hidden">
        {/* Drawer Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-gray-900">Your Cart</h3>
              {restaurant && <p className="text-xs font-semibold text-rose-600">{restaurant.name}</p>}
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Auth Notice Alert */}
        {!isLoggedIn && (
          <div className="p-3.5 bg-rose-50 border-b border-rose-200 text-rose-800 text-xs font-bold flex items-center justify-between px-6">
            <div className="flex items-center gap-2">
              <LogIn className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>Sign in required to checkout and place orders.</span>
            </div>
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onRequireLogin) onRequireLogin();
              }}
              className="text-[11px] font-black underline text-rose-700 hover:text-rose-900 ml-2"
            >
              Sign In
            </button>
          </div>
        )}

        {/* Vendor Ordering Warning Alert */}
        {isVendor && (
          <div className="p-3 bg-amber-50 border-b border-amber-200 text-amber-800 text-xs font-bold flex items-center gap-2 px-6">
            <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>Vendor Account Mode: Food ordering is restricted for Vendor profiles.</span>
          </div>
        )}

        {/* Drawer Content */}
        {cartItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mb-4">
              <ShoppingBag className="w-10 h-10" />
            </div>
            <h4 className="text-lg font-extrabold text-gray-800">Your cart is empty</h4>
            <p className="text-xs font-medium text-gray-400 mt-1">Browse restaurants and add delicious items to get started!</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Items List */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Ordered Items</span>
              {cartItems.map((item) => (
                <div key={item.menuItemId} className="flex items-center justify-between bg-gray-50 p-3 rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80'}
                      alt={item.name}
                      className="w-12 h-12 rounded-xl object-cover"
                    />
                    <div>
                      <div className="text-xs font-extrabold text-gray-900">{item.name}</div>
                      <div className="text-xs font-black text-rose-600">₹{(item.price * item.quantity).toFixed(2)}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center bg-white border border-gray-200 rounded-xl px-1.5 py-0.5">
                      <button
                        onClick={() => updateQuantity(item.menuItemId, -1)}
                        className="p-1 text-gray-500 hover:text-rose-600"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 text-xs font-black text-gray-800">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.menuItemId, 1)}
                        className="p-1 text-gray-500 hover:text-rose-600"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.menuItemId)}
                      className="p-1 text-gray-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Delivery Form */}
            <form id="checkout-form" onSubmit={handleCheckout} className="space-y-3 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Delivery Details</span>
                
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  disabled={locating}
                  className="text-xs font-extrabold text-rose-600 hover:text-rose-700 flex items-center gap-1 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-lg transition-colors border border-rose-200"
                >
                  <Navigation className={`w-3.5 h-3.5 ${locating ? 'animate-spin' : ''}`} />
                  <span>{locating ? 'Locating...' : 'Use Current Location'}</span>
                </button>
              </div>

              {gpsSuccess && (
                <div className="text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 p-2 rounded-xl flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> GPS Location Auto-Filled!
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-rose-600" /> Delivery Address
                </label>
                <input
                  type="text"
                  required
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-rose-600" /> Phone Number
                </label>
                <input
                  type="text"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1 flex items-center gap-1">
                  <FileText className="w-3 h-3 text-rose-600" /> Driver Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ring bell or leave at doorstep"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800"
                />
              </div>
            </form>
          </div>
        )}

        {/* Drawer Footer Financial Summary */}
        {cartItems.length > 0 && (
          <div className="p-6 bg-gray-50 border-t border-gray-100 space-y-3">
            <div className="space-y-1.5 text-xs font-semibold text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span>₹{deliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Tax (GST 5%)</span>
                <span>₹{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-black text-gray-900 pt-2 border-t border-gray-200">
                <span>Total Amount</span>
                <span className="text-rose-600">₹{total.toFixed(2)}</span>
              </div>
            </div>

            <button
              type="submit"
              form="checkout-form"
              disabled={loading || isVendor}
              className={`w-full py-3.5 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-98 ${
                !isLoggedIn
                  ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/25'
                  : isVendor 
                  ? 'bg-gray-300 text-gray-600 cursor-not-allowed shadow-none' 
                  : 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/25'
              }`}
            >
              <span>
                {!isLoggedIn 
                  ? 'Sign In to Complete Order' 
                  : isVendor 
                  ? 'Vendor Mode (Ordering Disabled)' 
                  : loading 
                  ? 'Processing Order...' 
                  : 'Place Order Now'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
