import React, { useState } from 'react';
import { Store, Clock, MapPin, Phone, Power, Image as ImageIcon } from 'lucide-react';
import { fetchApi } from '../../api/client';
import { formatDirectImageUrl } from '../../utils/imageUrl';

export default function RestaurantProfile({ profile, onRefresh }) {
  const [name, setName] = useState(profile?.name || '');
  const [cuisine, setCuisine] = useState(profile?.cuisine || '');
  const [isOpen, setIsOpen] = useState(profile?.isOpen ?? true);
  const [openingHours, setOpeningHours] = useState(profile?.openingHours || '11:00 AM - 11:00 PM');
  const [address, setAddress] = useState(profile?.address || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [imageUrl, setImageUrl] = useState(profile?.imageUrl || profile?.image_url || '');
  const [saving, setSaving] = useState(false);

  // Sync state if profile prop updates
  React.useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setCuisine(profile.cuisine || '');
      setIsOpen(profile.isOpen ?? true);
      setOpeningHours(profile.openingHours || '11:00 AM - 11:00 PM');
      setAddress(profile.address || '');
      setPhone(profile.phone || '');
      setImageUrl(profile.imageUrl || profile.image_url || '');
    }
  }, [profile]);

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
    if (!name.trim()) {
      alert('Restaurant name cannot be empty.');
      return;
    }
    try {
      setSaving(true);
      const formattedImg = formatDirectImageUrl(imageUrl);
      await fetchApi('/vendor/profile', {
        method: 'PUT',
        body: JSON.stringify({ 
          name: name.trim(),
          cuisine: cuisine.trim(),
          openingHours, 
          address, 
          phone, 
          imageUrl: formattedImg 
        })
      });
      setImageUrl(formattedImg);
      alert('Restaurant name and operating profile saved successfully!');
      onRefresh();
    } catch (err) {
      alert('Error saving profile: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const currentDisplayImg = formatDirectImageUrl(imageUrl || profile.imageUrl || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80');

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <img
            src={currentDisplayImg}
            alt={profile.name}
            className="w-16 h-16 rounded-2xl object-cover border border-gray-200 shadow-sm"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80';
            }}
          />
          <div>
            <h2 className="text-xl font-black text-gray-900">{name || profile.name}</h2>
            <p className="text-xs font-semibold text-gray-500">{cuisine || profile.cuisine || 'Restaurant Partner'} • Rating: ⭐ {profile.rating}</p>
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
        
        {/* Restaurant Name (Editable) */}
        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5 text-rose-600" /> Restaurant Brand Name (Public Storefront Display)
            </span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              Editable Anytime
            </span>
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Aunty's Kitchen, Telugu Ruchulu, Campus Cafe..."
            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-extrabold text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all"
          />
        </div>

        {/* Cuisine Specialties */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Store className="w-3.5 h-3.5 text-rose-600" /> Cuisine / Food Types
          </label>
          <input
            type="text"
            value={cuisine}
            onChange={(e) => setCuisine(e.target.value)}
            placeholder="e.g. Biryani, Tiffins, Chinese"
            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all"
          />
        </div>

        {/* Restaurant Image URL with Google Drive Support */}
        <div className="md:col-span-3 bg-gray-50/80 p-3.5 rounded-2xl border border-gray-200 space-y-2">
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-rose-600" /> Restaurant Cover Image / Banner URL
            </span>
            <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
              Google Drive links supported
            </span>
          </label>
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <input
              type="text"
              placeholder="Paste Google Drive share link, Unsplash, or direct image URL..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="flex-1 w-full px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
            {imageUrl && (
              <img
                src={formatDirectImageUrl(imageUrl)}
                alt="Preview"
                className="w-10 h-10 rounded-xl object-cover border border-gray-300 shadow-xs flex-shrink-0"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            )}
          </div>
          <p className="text-[11px] text-gray-500 font-medium">
            💡 <strong>Google Drive:</strong> In Drive, click Share &rarr; select <em>"Anyone with the link can view"</em> &rarr; Copy link & paste here. It will automatically convert and display!
          </p>
        </div>

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
              Save Profile
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
