import React, { useState } from 'react';
import { UserPlus, Store, X } from 'lucide-react';
import { fetchApi } from '../../api/client';

export default function VendorOnboardingModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    ownerName: '',
    ownerEmail: '',
    ownerPassword: 'vendor123',
    restaurantName: '',
    cuisine: 'American & Burgers',
    address: '',
    phone: '',
    commissionRate: '15.0'
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await fetchApi('/admin/restaurants/onboard', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      onSuccess();
      onClose();
    } catch (err) {
      alert('Failed to onboard vendor: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-rose-600" />
            <h3 className="text-lg font-extrabold text-gray-900">Onboard New Restaurant</h3>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="py-4 space-y-3">
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase">Restaurant Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Taco Fiesta"
              value={formData.restaurantName}
              onChange={(e) => setFormData({ ...formData, restaurantName: e.target.value })}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase">Cuisine Type</label>
              <input
                type="text"
                required
                placeholder="e.g. Mexican"
                value={formData.cuisine}
                onChange={(e) => setFormData({ ...formData, cuisine: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold mt-1"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase">Commission Rate (%)</label>
              <input
                type="number"
                step="0.5"
                required
                value={formData.commissionRate}
                onChange={(e) => setFormData({ ...formData, commissionRate: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold mt-1"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase">Owner Email</label>
            <input
              type="email"
              required
              placeholder="vendor@tacofiesta.com"
              value={formData.ownerEmail}
              onChange={(e) => setFormData({ ...formData, ownerEmail: e.target.value })}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase">Owner Name</label>
              <input
                type="text"
                required
                placeholder="Carlos Gomez"
                value={formData.ownerName}
                onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold mt-1"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase">Initial Password</label>
              <input
                type="text"
                required
                value={formData.ownerPassword}
                onChange={(e) => setFormData({ ...formData, ownerPassword: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold mt-1"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-rose-600 text-white text-xs font-extrabold rounded-xl hover:bg-rose-700 shadow-md"
            >
              {loading ? 'Onboarding...' : 'Onboard Vendor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
