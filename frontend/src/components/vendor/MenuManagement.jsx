import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Utensils, Check, X, AlertCircle, Upload, Zap, Camera } from 'lucide-react';
import { fetchApi } from '../../api/client';
import BulkMenuUploadModal from './BulkMenuUploadModal';

export default function MenuManagement({ menuItems = [], onRefresh }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Main',
    imageUrl: '',
    isAvailable: true
  });
  const [loading, setLoading] = useState(false);
  const [populating, setPopulating] = useState(false);

  const handleAutoPopulate = async () => {
    if (!window.confirm('Populate full sample Indian menu items (in ₹ INR)?')) return;
    try {
      setPopulating(true);
      const res = await fetchApi('/vendor/menu/auto-populate', { method: 'POST' });
      alert(`✅ ${res.message || 'Menu auto-populated successfully!'}`);
      onRefresh();
    } catch (err) {
      alert('Error auto-populating menu: ' + err.message);
    } finally {
      setPopulating(false);
    }
  };

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      category: 'Main',
      imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
      isAvailable: true
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      price: item.price.toString(),
      category: item.category,
      imageUrl: item.imageUrl || '',
      isAvailable: item.isAvailable
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (editingItem) {
        await fetchApi(`/vendor/menu/${editingItem.id}`, {
          method: 'PUT',
          body: JSON.stringify(formData)
        });
      } else {
        await fetchApi('/vendor/menu', {
          method: 'POST',
          body: JSON.stringify(formData)
        });
      }
      setIsModalOpen(false);
      onRefresh();
    } catch (err) {
      alert('Error saving menu item: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this menu item?')) return;
    try {
      await fetchApi(`/vendor/menu/${itemId}`, { method: 'DELETE' });
      onRefresh();
    } catch (err) {
      alert('Error deleting menu item: ' + err.message);
    }
  };

  const handleToggleAvailability = async (item) => {
    try {
      await fetchApi(`/vendor/menu/${item.id}`, {
        method: 'PUT',
        body: JSON.stringify({ isAvailable: !item.isAvailable })
      });
      onRefresh();
    } catch (err) {
      alert('Error updating availability: ' + err.message);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100">
        <div>
          <h2 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
            <Utensils className="w-5 h-5 text-amber-600" />
            Menu Catalog & Availability Switcher
          </h2>
          <p className="text-xs font-semibold text-gray-400">Swipe/toggle switch to instantly mark items as In-Stock or Out-of-Stock</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Auto Populate Menu Button */}
          <button
            onClick={handleAutoPopulate}
            disabled={populating}
            className="bg-amber-500 hover:bg-amber-600 text-white px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-sm transition-all active:scale-95 disabled:opacity-50"
          >
            <Zap className="w-4 h-4 text-white fill-white" /> {populating ? 'Populating...' : '⚡ Auto-Populate Full Menu'}
          </button>

          {/* Bulk Upload Button */}
          <button
            onClick={() => setIsBulkModalOpen(true)}
            className="bg-gray-900 hover:bg-black text-white px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
          >
            <Camera className="w-4 h-4 text-rose-400" /> Upload Menu Card Photo / CSV
          </button>

          {/* Add Item Button */}
          <button
            onClick={openAddModal}
            className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-md transition-transform active:scale-95"
          >
            <Plus className="w-4 h-4" /> Add Single Item
          </button>
        </div>
      </div>

      {/* Grid of Menu Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {menuItems.map((item) => {
          const isItemAvailable = item.isAvailable ?? item.is_available ?? true;
          const isOut = !isItemAvailable;

          return (
            <div
              key={item.id}
              className={`rounded-2xl p-4 border transition-all flex gap-3 relative overflow-hidden group ${
                isOut
                  ? 'bg-gray-950 border-gray-800 text-gray-400'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              {/* Black Overlay when Out of Stock */}
              {isOut && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-[1px] z-10 p-3 flex flex-col justify-between pointer-events-none">
                  <div className="flex items-center justify-between">
                    <span className="bg-rose-600 text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> OUT OF STOCK
                    </span>
                  </div>
                </div>
              )}

              {/* Image */}
              <img
                src={item.imageUrl || item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80'}
                alt={item.name}
                className={`w-20 h-20 rounded-xl object-cover border border-gray-200 flex-shrink-0 ${
                  isOut ? 'grayscale opacity-40' : ''
                }`}
              />

              {/* Details */}
              <div className="flex-1 min-w-0 z-20 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        isOut ? 'bg-gray-800 text-gray-400' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {item.category || 'Main'}
                      </span>
                      <h4 className={`font-extrabold text-sm truncate mt-1 ${isOut ? 'text-gray-300' : 'text-gray-900'}`}>
                        {item.name}
                      </h4>
                    </div>
                    <span className={`font-black text-sm ${isOut ? 'text-rose-400' : 'text-rose-600'}`}>
                      ₹{Number(item.price).toFixed(2)}
                    </span>
                  </div>

                  <p className={`text-[11px] font-medium line-clamp-2 mt-1 ${isOut ? 'text-gray-500' : 'text-gray-500'}`}>
                    {item.description}
                  </p>
                </div>

                {/* Status and Action Controls */}
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-200/20">
                  
                  {/* Modern Interactive Swipe/Toggle Switch */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleAvailability(item)}
                      className={`relative inline-flex h-6 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        isItemAvailable ? 'bg-emerald-500' : 'bg-rose-600'
                      }`}
                      title="Click/Swipe to toggle availability"
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out flex items-center justify-center ${
                          isItemAvailable ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      >
                        {isItemAvailable ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <X className="w-3 h-3 text-rose-600" />
                        )}
                      </span>
                    </button>

                    <span className={`text-[11px] font-extrabold ${isItemAvailable ? 'text-emerald-600' : 'text-rose-400'}`}>
                      {isItemAvailable ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(item)}
                      className="p-1.5 text-gray-400 hover:text-rose-400 hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 text-gray-400 hover:text-rose-400 hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Single Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
            <h3 className="text-lg font-extrabold text-gray-900 mb-4">
              {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase">Item Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase">Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold mt-1"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold mt-1"
                  >
                    <option value="Main">Main</option>
                    <option value="Burgers">Burgers</option>
                    <option value="Pizza">Pizza</option>
                    <option value="Sushi">Sushi</option>
                    <option value="Ramen">Ramen</option>
                    <option value="Sides">Sides</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Desserts">Desserts</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase">Description</label>
                <textarea
                  rows="2"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold mt-1"
                ></textarea>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase">Image URL</label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold mt-1"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-rose-600 text-white text-xs font-extrabold rounded-xl hover:bg-rose-700 shadow-md"
                >
                  {loading ? 'Saving...' : 'Save Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Upload Modal */}
      <BulkMenuUploadModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        onSuccess={onRefresh}
      />
    </div>
  );
}
