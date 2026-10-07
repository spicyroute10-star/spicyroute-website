import React, { useState } from 'react';
import { Search, CheckCircle, XCircle, Edit, DollarSign, Store, ShieldAlert, Trash2 } from 'lucide-react';
import { fetchApi } from '../../api/client';

export default function RestaurantPerformanceTable({ distribution, onRefresh }) {
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [commissionRateInput, setCommissionRateInput] = useState('');
  const [updating, setUpdating] = useState(false);

  const safeDistribution = Array.isArray(distribution) ? distribution : [];
  const filtered = safeDistribution.filter(r =>
    String(r?.restaurantName || '').toLowerCase().includes(search.toLowerCase()) ||
    String(r?.cuisine || '').toLowerCase().includes(search.toLowerCase()) ||
    String(r?.ownerName || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleToggleStatus = async (restaurantId, currentApproval, currentOpen) => {
    try {
      setUpdating(true);
      await fetchApi(`/admin/restaurants/${restaurantId}/status`, {
        method: 'PUT',
        body: JSON.stringify({
          isApproved: !currentApproval
        })
      });
      onRefresh();
    } catch (err) {
      alert('Error updating vendor status: ' + err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveCommission = async (restaurantId) => {
    try {
      const rate = parseFloat(commissionRateInput);
      if (isNaN(rate) || rate < 0 || rate > 100) {
        alert('Please enter a valid percentage rate between 0 and 100');
        return;
      }
      setUpdating(true);
      await fetchApi(`/admin/restaurants/${restaurantId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ commissionRate: rate })
      });
      setEditingId(null);
      onRefresh();
    } catch (err) {
      alert('Error updating commission rate: ' + err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteRestaurant = async (restaurantId, restaurantName) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${restaurantName}"? This action cannot be undone.`)) return;
    try {
      setUpdating(true);
      await fetchApi(`/admin/restaurants/${restaurantId}`, {
        method: 'DELETE'
      });
      alert(`🗑️ "${restaurantName}" has been permanently deleted.`);
      onRefresh();
    } catch (err) {
      alert('Error deleting restaurant: ' + err.message);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-8">
      {/* Header Bar */}
      <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
            <Store className="w-5 h-5 text-rose-600" />
            Restaurant-Wise Order Distribution & Controls
          </h2>
          <p className="text-xs font-medium text-gray-500 mt-0.5">
            Real-time aggregate order statistics, revenue breakdown, and vendor permissions
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search restaurant or cuisine..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-500 font-extrabold uppercase tracking-wider">
              <th className="py-3.5 px-6">Restaurant & Owner</th>
              <th className="py-3.5 px-4 text-center">Status</th>
              <th className="py-3.5 px-4 text-center">Total Orders</th>
              <th className="py-3.5 px-4 text-center">Active Orders</th>
              <th className="py-3.5 px-4 text-right">Revenue (GMV)</th>
              <th className="py-3.5 px-4 text-center">Application Fee</th>
              <th className="py-3.5 px-4 text-right">Platform Earned</th>
              <th className="py-3.5 px-6 text-center">Admin Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="8" className="py-8 text-center text-gray-400">
                  No restaurants match search query.
                </td>
              </tr>
            ) : (
              filtered.map((r, idx) => (
                <tr key={r?.restaurantId || r?.id || idx} className="hover:bg-rose-50/30 transition-colors">
                  {/* Name */}
                  <td className="py-4 px-6">
                    <div className="font-extrabold text-gray-900 text-sm">{r?.restaurantName || 'Unnamed Restaurant'}</div>
                    <div className="text-[11px] text-gray-400 font-semibold">{r?.cuisine || 'General'} • Owner: {r?.ownerName || 'Unknown'} ({r?.ownerEmail || 'No email'})</div>
                  </td>

                  {/* Status Badge */}
                  <td className="py-4 px-4 text-center">
                    {r?.isApproved ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                        <CheckCircle className="w-3 h-3 text-emerald-600" /> Approved
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">
                        <XCircle className="w-3 h-3 text-rose-600" /> Suspended
                      </span>
                    )}
                  </td>

                  {/* Total Orders */}
                  <td className="py-4 px-4 text-center font-extrabold text-gray-900 text-sm">
                    {Number(r?.totalOrders || 0)}
                  </td>

                  {/* Active Orders */}
                  <td className="py-4 px-4 text-center">
                    {Number(r?.activeOrders || 0) > 0 ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-100 text-amber-800 border border-amber-300">
                        {r.activeOrders} active
                      </span>
                    ) : (
                      <span className="text-gray-400 font-semibold">0</span>
                    )}
                  </td>

                  {/* Revenue GMV */}
                  <td className="py-4 px-4 text-right font-extrabold text-gray-900 text-sm">
                    ₹{Number(r?.totalRevenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>

                  {/* Application Fee */}
                  <td className="py-4 px-4 text-center">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-extrabold">
                      ₹5 / item
                    </span>
                  </td>

                  {/* Platform Earned */}
                  <td className="py-4 px-4 text-right font-extrabold text-rose-600 text-sm">
                    ₹{Number(r?.commissionEarned || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>

                  {/* Admin Action */}
                  <td className="py-4 px-6 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleToggleStatus(r?.restaurantId, r?.isApproved, r?.isOpen)}
                        disabled={updating}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm ${
                          r?.isApproved
                            ? 'bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white border border-rose-200'
                            : 'bg-emerald-600 text-white hover:bg-emerald-700'
                        }`}
                      >
                        {r?.isApproved ? 'Suspend' : 'Approve'}
                      </button>
                      <button
                        onClick={() => handleDeleteRestaurant(r?.restaurantId, r?.restaurantName)}
                        disabled={updating}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all cursor-pointer"
                        title="Permanently Delete Restaurant"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
