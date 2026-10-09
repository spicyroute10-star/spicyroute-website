import React, { useState, useEffect } from 'react';
import { Tag, Plus, Trash2, Power, X, Sparkles, CheckCircle2, AlertCircle, Percent } from 'lucide-react';
import { fetchApi } from '../../api/client';

export default function CouponManagementModal({ isOpen, onClose }) {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  // Form State
  const [code, setCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState('10');
  const [description, setDescription] = useState('Flat 10% discount on food orders');
  const [minOrder, setMinOrder] = useState('0');
  const [maxUses, setMaxUses] = useState('0');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const loadCoupons = async () => {
    try {
      setLoading(true);
      const res = await fetchApi('/admin/coupons');
      setCoupons(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error loading coupons:', err);
      setError('Failed to fetch coupons: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadCoupons();
      setError('');
      setSuccessMsg('');
    }
  }, [isOpen]);

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      setError('Coupon code cannot be empty.');
      return;
    }

    const pct = parseFloat(discountPercent);
    if (isNaN(pct) || pct <= 0 || pct > 100) {
      setError('Discount percentage must be between 1% and 100%.');
      return;
    }

    const parsedUses = parseInt(maxUses, 10);
    const finalMaxUses = isNaN(parsedUses) || parsedUses < 0 ? 0 : parsedUses;

    try {
      setCreating(true);
      const res = await fetchApi('/admin/coupons', {
        method: 'POST',
        body: JSON.stringify({
          code: cleanCode,
          discountPercent: pct,
          description: description.trim(),
          minOrder: parseFloat(minOrder) || 0,
          maxUses: finalMaxUses
        })
      });

      setSuccessMsg(`Coupon "${cleanCode}" (${pct}% OFF, ${finalMaxUses > 0 ? `${finalMaxUses} uses` : 'Unlimited uses'}) created successfully!`);
      setCode('');
      setDiscountPercent('10');
      setDescription('Flat 10% discount on food orders');
      setMinOrder('0');
      setMaxUses('0');
      loadCoupons();
    } catch (err) {
      setError(err.message || 'Failed to create coupon');
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateLimit = async (couponId, currentLimit) => {
    const input = window.prompt('Enter new maximum usage limit (0 for unlimited):', currentLimit ?? 0);
    if (input === null) return;
    const num = parseInt(input, 10);
    if (isNaN(num) || num < 0) {
      alert('Please enter a valid positive number or 0 for unlimited.');
      return;
    }
    try {
      setUpdatingId(couponId);
      await fetchApi(`/admin/coupons/${couponId}`, {
        method: 'PUT',
        body: JSON.stringify({ maxUses: num })
      });
      loadCoupons();
    } catch (err) {
      alert('Failed to update usage limit: ' + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleStatus = async (couponId, currentStatus) => {
    try {
      setUpdatingId(couponId);
      await fetchApi(`/admin/coupons/${couponId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ isActive: !currentStatus })
      });
      loadCoupons();
    } catch (err) {
      alert('Error updating coupon: ' + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (couponId, couponCode) => {
    if (!window.confirm(`Are you sure you want to delete coupon "${couponCode}"?`)) return;
    try {
      setUpdatingId(couponId);
      await fetchApi(`/admin/coupons/${couponId}`, {
        method: 'DELETE'
      });
      loadCoupons();
    } catch (err) {
      alert('Error deleting coupon: ' + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-gray-100 space-y-6 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-sm">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900 leading-snug">
                Coupon & Promo Code Management
              </h2>
              <p className="text-xs font-semibold text-gray-500">
                Create promotional discount codes with custom usage limits (e.g. 50 uses or unlimited)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto space-y-6 pr-1">
          
          {/* Create Coupon Card */}
          <div className="bg-gradient-to-r from-rose-50/60 via-amber-50/40 to-rose-50/60 rounded-2xl border border-rose-200/80 p-5 space-y-4">
            <div className="flex items-center gap-2 text-xs font-black text-rose-900 uppercase tracking-wider">
              <Plus className="w-4 h-4 text-rose-600" />
              <span>Create New Promo Coupon</span>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Coupon Code (Alphanumeric)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SPICY10, WELCOME50"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="w-full px-3.5 py-2 bg-white border border-rose-200 rounded-xl text-xs font-black uppercase tracking-wider text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Discount Percentage (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min="1"
                      max="100"
                      step="1"
                      value={discountPercent}
                      onChange={(e) => setDiscountPercent(e.target.value)}
                      placeholder="e.g. 10"
                      className="w-full pl-3.5 pr-8 py-2 bg-white border border-rose-200 rounded-xl text-xs font-black text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-black text-rose-500">%</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Description / Banner Note
                </label>
                <input
                  type="text"
                  placeholder="e.g. Flat 10% discount on food orders"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-rose-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Min Order (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="0 for no minimum"
                    value={minOrder}
                    onChange={(e) => setMinOrder(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-rose-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span>Usage Limit (Max Uses)</span>
                    <span className="text-[10px] text-gray-400 font-normal lowercase">(0 = unlimited)</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="e.g. 50 (0 for unlimited)"
                    value={maxUses}
                    onChange={(e) => setMaxUses(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-rose-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              {error && (
                <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={creating}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black shadow-md transition-all flex items-center justify-center gap-2"
              >
                {creating ? 'Saving Coupon...' : 'Save & Publish Coupon'}
              </button>
            </form>
          </div>

          {/* Active & Existing Coupons Table */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center justify-between">
              <span>All Configured Coupons ({coupons.length})</span>
              <span className="text-[10px] font-bold text-gray-400">Instant Live Sync</span>
            </h3>

            {loading ? (
              <p className="text-xs text-gray-400 text-center py-6">Loading coupons...</p>
            ) : coupons.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6">No coupons created yet. Add one above!</p>
            ) : (
              <div className="space-y-2">
                {coupons.map((c) => {
                  const isLimitReached = c.maxUses > 0 && (c.usedCount || 0) >= c.maxUses;

                  return (
                    <div
                      key={c.id}
                      className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isLimitReached
                          ? 'bg-red-50/50 border-red-200 opacity-90'
                          : c.isActive
                          ? 'bg-white border-gray-200 shadow-2xs hover:border-emerald-300'
                          : 'bg-gray-50 border-gray-200 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${
                          isLimitReached 
                            ? 'bg-red-100 text-red-800'
                            : c.isActive 
                            ? 'bg-amber-100 text-amber-800' 
                            : 'bg-gray-200 text-gray-600'
                        }`}>
                          <Percent className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-black text-gray-900 text-sm tracking-wide">{c.code}</span>
                            <span className="bg-rose-100 text-rose-800 text-[10px] font-black px-2 py-0.5 rounded-md">
                              {c.discountPercent}% OFF
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              c.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-700'
                            }`}>
                              {c.isActive ? 'Active' : 'Disabled'}
                            </span>

                            {/* Usage Limit Tracker Badge */}
                            {c.maxUses > 0 ? (
                              <button
                                type="button"
                                onClick={() => handleUpdateLimit(c.id, c.maxUses)}
                                title="Click to edit max usage limit"
                                className={`text-[10px] font-black px-2 py-0.5 rounded-md transition-transform hover:scale-105 cursor-pointer ${
                                  isLimitReached
                                    ? 'bg-red-600 text-white shadow-xs'
                                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                                }`}
                              >
                                {isLimitReached
                                  ? `🚨 LIMIT REACHED (${c.usedCount || 0}/${c.maxUses})`
                                  : `🎟️ Uses: ${c.usedCount || 0} / ${c.maxUses}`}
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleUpdateLimit(c.id, c.maxUses)}
                                title="Click to set a usage limit"
                                className="text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md transition-colors cursor-pointer"
                              >
                                🎟️ Uses: {c.usedCount || 0} / ∞ (Unlimited)
                              </button>
                            )}
                          </div>
                          <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                            {c.description} {c.minOrder > 0 ? `• Min Order ₹${c.minOrder}` : '• No Min Order'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <button
                          onClick={() => handleToggleStatus(c.id, c.isActive)}
                          disabled={updatingId === c.id}
                          className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold flex items-center gap-1.5 transition-colors ${
                            c.isActive
                              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs'
                          }`}
                        >
                          <Power className="w-3.5 h-3.5" />
                          <span>{c.isActive ? 'Deactivate' : 'Activate'}</span>
                        </button>

                        <button
                          onClick={() => handleDelete(c.id, c.code)}
                          disabled={updatingId === c.id}
                          className="p-1.5 rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                          title="Delete Coupon"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-gray-100 flex justify-end flex-shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
