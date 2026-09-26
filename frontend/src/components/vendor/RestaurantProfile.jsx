import React, { useState } from 'react';
import { Store, Clock, MapPin, Phone, Power } from 'lucide-react';
import { fetchApi } from '../../api/client';

export default function RestaurantProfile({ profile, onRefresh }) {
  const [isOpen, setIsOpen] = useState(profile?.isOpen ?? true);
  const [openingHours, setOpeningHours] = useState(profile?.openingHours || '11:00 AM - 11:00 PM');
  const [address, setAddress] = useState(profile?.address || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [saving, setSaving] = useState(false);

  if (!profile) return null;

  const handleToggleOnline = async () => {
    try {
      setSaving(true);
      const newStatus = !isOpen;
      await fetchApi('/vendor/profile', {
        method: 'PUT',
        body: JSON.stringify({ isOpen: newStatus })
      });
      setIsOpen(newStatus);
      onRefresh();
    } catch (err) {
      alert('Error updating restaurant status: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDetails = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await fetchApi('/vendor/profile', {
        method: 'PUT',
        body: JSON.stringify({ openingHours, address, phone })
      });
      alert('Restaurant operating profile saved!');
      onRefresh();
    } catch (err) {
      alert('Error saving profile: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <img
            src={profile.imageUrl || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80'}
            alt={profile.name}
            className="w-14 h-14 rounded-2xl object-cover border border-gray-200 shadow-sm"
          />
          <div>
            <h2 className="text-xl font-black text-gray-900">{profile.name}</h2>
            <p className="text-xs font-semibold text-gray-500">{profile.cuisine} • Rating: ⭐ {profile.rating}</p>
          </div>
        </div>

        {/* Online / Offline Status Toggle Button */}
        <button
          onClick={handleToggleOnline}
          disabled={saving}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-extrabold text-xs shadow-md transition-all ${
            isOpen
              ? 'bg-emerald-600 text-white hover:bg-emerald-700 ring-2 ring-emerald-400/30'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <Power className="w-4 h-4" />
          <span>{isOpen ? 'Store Status: ONLINE (Accepting Orders)' : 'Store Status: OFFLINE (Paused)'}</span>
        </button>
      </div>

      {/* Edit Details Form */}
      <form onSubmit={handleSaveDetails} className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-rose-600" /> Operating Hours
          </label>
          <input
            type="text"
            value={openingHours}
            onChange={(e) => setOpeningHours(e.target.value)}
            className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-rose-600" /> Address
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 flex items-center gap-1">
            <Phone className="w-3.5 h-3.5 text-rose-600" /> Phone Contact
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800"
            />
            <button
              type="submit"
              disabled={saving}
              className="bg-rose-600 text-white font-extrabold text-xs px-4 py-2 rounded-xl hover:bg-rose-700 shadow-sm flex-shrink-0"
            >
              Save
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
