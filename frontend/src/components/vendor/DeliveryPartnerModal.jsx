import React, { useState, useEffect } from 'react';
import { Truck, UserCheck, Plus, X, Phone, User } from 'lucide-react';
import { fetchApi } from '../../api/client';

export default function DeliveryPartnerModal({ isOpen, onClose, onConfirm, order }) {
  const [partners, setPartners] = useState([]);
  const [selectedPartnerId, setSelectedPartnerId] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newDriver, setNewDriver] = useState({ name: '', phone: '', vehicleNumber: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    fetchApi('/vendor/delivery-partners')
      .then((res) => {
        setPartners(res.data);
        if (res.data && res.data.length > 0) {
          setSelectedPartnerId(res.data[0].id.toString());
        } else {
          setIsAddingNew(true);
        }
      })
      .catch((err) => console.error('Error fetching delivery partners:', err));
  }, [isOpen]);

  if (!isOpen || !order) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isAddingNew) {
        if (!newDriver.name || !newDriver.phone) {
          alert('Driver name and phone number are required');
          setLoading(false);
          return;
        }
        // Save new driver to roster and confirm dispatch
        const createdRes = await fetchApi('/vendor/delivery-partners', {
          method: 'POST',
          body: JSON.stringify(newDriver)
        });

        onConfirm({
          deliveryPartnerId: createdRes.data.id,
          deliveryPartnerName: createdRes.data.name,
          deliveryPartnerPhone: createdRes.data.phone,
          deliveryPartnerVehicle: createdRes.data.vehicleNumber
        });
      } else {
        const selected = partners.find((p) => p.id.toString() === selectedPartnerId);
        if (!selected) {
          alert('Please select a delivery partner');
          setLoading(false);
          return;
        }

        onConfirm({
          deliveryPartnerId: selected.id,
          deliveryPartnerName: selected.name,
          deliveryPartnerPhone: selected.phone,
          deliveryPartnerVehicle: selected.vehicleNumber
        });
      }
    } catch (err) {
      alert('Error assigning driver: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-gray-900">Dispatch Order {order.orderNumber}</h3>
              <p className="text-xs font-semibold text-gray-400">Assign a delivery rider for out-for-delivery</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="py-4 space-y-4">
          {!isAddingNew && partners.length > 0 ? (
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Select Saved Delivery Partner
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {partners.map((p) => (
                  <label
                    key={p.id}
                    className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all ${
                      selectedPartnerId === p.id.toString()
                        ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="partner"
                        value={p.id}
                        checked={selectedPartnerId === p.id.toString()}
                        onChange={() => setSelectedPartnerId(p.id.toString())}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <div>
                        <div className="text-xs font-black text-gray-900">{p.name}</div>
                        <div className="text-[11px] font-semibold text-gray-500">{p.phone} • {p.vehicleNumber}</div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setIsAddingNew(true)}
                className="mt-3 text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Enter New Driver Number
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  New Delivery Rider Details
                </span>
                {partners.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setIsAddingNew(false)}
                    className="text-xs font-bold text-gray-400 hover:text-gray-600"
                  >
                    Select from saved
                  </button>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1">Rider Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={newDriver.name}
                  onChange={(e) => setNewDriver({ ...newDriver, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1">Phone Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. +1 (555) 987-6543"
                  value={newDriver.phone}
                  onChange={(e) => setNewDriver({ ...newDriver, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1">Vehicle / Scooter #</label>
                <input
                  type="text"
                  placeholder="e.g. Motorbike MTR-492"
                  value={newDriver.vehicleNumber}
                  onChange={(e) => setNewDriver({ ...newDriver, vehicleNumber: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold"
                />
              </div>
            </div>
          )}

          <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
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
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-md transition-all"
            >
              <UserCheck className="w-4 h-4" />
              <span>{loading ? 'Dispatching...' : 'Assign & Dispatch'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
