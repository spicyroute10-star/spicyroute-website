import React, { useState, useEffect } from 'react';
import { Truck, Plus, Trash2, Phone, User, Bike } from 'lucide-react';
import { fetchApi } from '../../api/client';

export default function DeliveryPartnerRoster() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [adding, setAdding] = useState(false);

  const loadPartners = async () => {
    try {
      setLoading(true);
      const res = await fetchApi('/vendor/delivery-partners');
      setPartners(res.data);
    } catch (err) {
      console.error('Error loading partners:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPartners();
  }, []);

  const handleAddPartner = async (e) => {
    e.preventDefault();
    if (!name || !phone) return;
    try {
      setAdding(true);
      await fetchApi('/vendor/delivery-partners', {
        method: 'POST',
        body: JSON.stringify({ name, phone, vehicleNumber })
      });
      setName('');
      setPhone('');
      setVehicleNumber('');
      loadPartners();
    } catch (err) {
      alert('Error adding partner: ' + err.message);
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this saved delivery partner?')) return;
    try {
      await fetchApi(`/vendor/delivery-partners/${id}`, { method: 'DELETE' });
      loadPartners();
    } catch (err) {
      alert('Error removing partner: ' + err.message);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-8 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <div>
          <h2 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
            <Truck className="w-5 h-5 text-indigo-600" />
            Delivery Partners Directory
          </h2>
          <p className="text-xs font-semibold text-gray-400">Save frequent drivers for quick 1-click dispatching</p>
        </div>
      </div>

      {/* Add New Driver Form */}
      <form onSubmit={handleAddPartner} className="bg-gray-50 p-4 rounded-2xl border border-gray-200 grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
        <div>
          <label className="block text-[11px] font-bold text-gray-500 uppercase">Driver Name</label>
          <input
            type="text"
            required
            placeholder="e.g. David Miller"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold mt-1"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-gray-500 uppercase">Phone Number</label>
          <input
            type="text"
            required
            placeholder="+1 (555) 987-6543"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold mt-1"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-gray-500 uppercase">Vehicle / Scooter #</label>
          <input
            type="text"
            placeholder="MTR-8849"
            value={vehicleNumber}
            onChange={(e) => setVehicleNumber(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold mt-1"
          />
        </div>

        <button
          type="submit"
          disabled={adding}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs py-2.5 px-4 rounded-xl shadow-md flex items-center justify-center gap-1 transition-all"
        >
          <Plus className="w-4 h-4" /> Save Delivery Driver
        </button>
      </form>

      {/* Roster Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-3 text-center py-6 text-xs text-gray-400">Loading delivery drivers...</div>
        ) : partners.length === 0 ? (
          <div className="col-span-3 text-center py-8 text-xs font-medium text-gray-400">
            No saved delivery drivers yet. Add your first driver above!
          </div>
        ) : (
          partners.map((p) => (
            <div key={p.id} className="bg-gray-50 rounded-2xl p-4 border border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                  <Bike className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-extrabold text-gray-900">{p.name}</div>
                  <div className="text-[11px] font-semibold text-gray-500 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-gray-400" /> {p.phone}
                  </div>
                  <div className="text-[10px] font-bold text-gray-400">{p.vehicleNumber}</div>
                </div>
              </div>

              <button
                onClick={() => handleDelete(p.id)}
                className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-white rounded-lg transition-colors"
                title="Remove Driver"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
