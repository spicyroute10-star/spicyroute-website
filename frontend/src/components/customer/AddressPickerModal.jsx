import React, { useState, useEffect } from 'react';
import { 
  MapPin, Navigation, Home, Briefcase, Plus, Check, 
  X, Loader2, Search, ArrowRight, ShieldCheck, Trash2 
} from 'lucide-react';

export default function AddressPickerModal({ isOpen, onClose, onSelectAddress, currentAddress }) {
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [locationSuccess, setLocationSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'add'

  // New address form state
  const [addressType, setAddressType] = useState('Home'); // 'Home' | 'Work' | 'Other'
  const [houseNo, setHouseNo] = useState('');
  const [areaStreet, setAreaStreet] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');

  // Saved addresses list
  const [savedAddresses, setSavedAddresses] = useState(() => {
    try {
      const saved = localStorage.getItem('spice_route_saved_addresses');
      return saved ? JSON.parse(saved) : [
        {
          id: 'addr-default-1',
          type: 'Home',
          address: currentAddress || 'Flat 101, Spice Residency, Indiranagar, Bengaluru, 560038',
          tag: 'Home'
        }
      ];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('spice_route_saved_addresses', JSON.stringify(savedAddresses));
    } catch (e) {
      console.error('Failed to save addresses:', e);
    }
  }, [savedAddresses]);

  if (!isOpen) return null;

  // Live GPS Geolocation with OpenStreetMap / Google Geocoding
  const handleDetectLiveLocation = () => {
    if (!navigator.geolocation) {
      alert('GPS Geolocation is not supported by your device or browser.');
      return;
    }

    setDetectingLocation(true);
    setLocationSuccess(false);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // OpenStreetMap Reverse Geocoding API (Fast, Free, No API key required)
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`
          );
          const data = await res.json();

          let fullAddress = '';
          let detectedArea = '';
          let detectedCity = '';
          let detectedPincode = '';

          if (data && data.address) {
            const addr = data.address;
            const road = addr.road || addr.street || addr.suburb || addr.neighbourhood || '';
            const locality = addr.city || addr.town || addr.village || addr.county || '';
            const state = addr.state || '';
            const zip = addr.postcode || '';

            detectedArea = road;
            detectedCity = locality;
            detectedPincode = zip;

            const parts = [road, locality, state, zip].filter(Boolean);
            fullAddress = parts.join(', ');
          }

          if (!fullAddress && data.display_name) {
            fullAddress = data.display_name;
          }

          if (!fullAddress) {
            fullAddress = `Live GPS: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          }

          const liveAddressItem = {
            id: 'addr-live-' + Date.now(),
            type: 'Current GPS',
            address: fullAddress,
            tag: 'GPS Location',
            lat: latitude,
            lng: longitude
          };

          // Save and select
          setSavedAddresses((prev) => [liveAddressItem, ...prev.filter(a => a.type !== 'Current GPS')]);
          onSelectAddress(fullAddress);
          setLocationSuccess(true);
          setTimeout(() => {
            setLocationSuccess(false);
            onClose();
          }, 1000);
        } catch (err) {
          console.error('Geocoding error:', err);
          const fallback = `Live Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
          onSelectAddress(fallback);
          onClose();
        } finally {
          setDetectingLocation(false);
        }
      },
      (error) => {
        setDetectingLocation(false);
        console.warn('Geolocation error:', error);
        alert('Could not access your location. Please ensure location/GPS permission is allowed in your device settings.');
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  };

  const handleSaveNewAddress = (e) => {
    e.preventDefault();
    if (!houseNo.trim() || !areaStreet.trim()) {
      alert('Please provide your flat/house number and street details.');
      return;
    }

    const fullAddrString = [
      houseNo.trim(),
      landmark ? `Near ${landmark.trim()}` : '',
      areaStreet.trim(),
      city.trim(),
      pincode.trim()
    ].filter(Boolean).join(', ');

    const newAddr = {
      id: 'addr-' + Date.now(),
      type: addressType,
      address: fullAddrString,
      tag: addressType
    };

    setSavedAddresses([newAddr, ...savedAddresses]);
    onSelectAddress(fullAddrString);
    setActiveTab('list');
    onClose();
  };

  const handleDeleteAddress = (id, e) => {
    e.stopPropagation();
    setSavedAddresses(savedAddresses.filter(a => a.id !== id));
  };

  const filteredAddresses = savedAddresses.filter(a => 
    a.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
              <MapPin className="w-5 h-5 text-rose-600" />
              <span>Select Delivery Location</span>
            </h3>
            <p className="text-xs font-semibold text-gray-400">
              Choose your address for accurate restaurant delivery & live tracking
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          
          {/* Action: Use Live GPS Location (Swiggy / Zomato style) */}
          <button
            onClick={handleDetectLiveLocation}
            disabled={detectingLocation}
            className="w-full p-4 bg-gradient-to-r from-rose-50 to-amber-50 hover:from-rose-100 hover:to-amber-100 border border-rose-200 rounded-2xl flex items-center justify-between transition-all group shadow-xs active:scale-98"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-md flex-shrink-0 group-hover:scale-105 transition-transform">
                {detectingLocation ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : locationSuccess ? (
                  <Check className="w-5 h-5 text-white" />
                ) : (
                  <Navigation className="w-5 h-5" />
                )}
              </div>
              <div className="text-left">
                <span className="block text-sm font-black text-rose-700">
                  {detectingLocation ? 'Fetching Live Location...' : locationSuccess ? 'GPS Location Detected!' : 'Use Current Live Location'}
                </span>
                <span className="block text-[11px] font-bold text-gray-500">
                  Using GPS / Google Maps coordinates
                </span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-rose-500 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Tab Navigation: Saved Addresses vs Add New Address */}
          <div className="flex border-b border-gray-100 pt-2">
            <button
              onClick={() => setActiveTab('list')}
              className={`pb-2.5 px-4 text-xs font-black border-b-2 transition-all ${
                activeTab === 'list'
                  ? 'border-rose-600 text-rose-600'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              Saved Addresses ({savedAddresses.length})
            </button>
            <button
              onClick={() => setActiveTab('add')}
              className={`pb-2.5 px-4 text-xs font-black border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'add'
                  ? 'border-rose-600 text-rose-600'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              <Plus className="w-3.5 h-3.5" /> Add New Address
            </button>
          </div>

          {/* TAB 1: SAVED ADDRESSES LIST */}
          {activeTab === 'list' && (
            <div className="space-y-3">
              {/* Search filter */}
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search saved addresses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              {filteredAddresses.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <p className="text-xs font-bold">No saved addresses found.</p>
                  <button
                    onClick={() => setActiveTab('add')}
                    className="mt-2 text-xs font-black text-rose-600 hover:underline"
                  >
                    + Add a new delivery address
                  </button>
                </div>
              ) : (
                <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                  {filteredAddresses.map((item) => {
                    const isSelected = currentAddress === item.address;

                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          onSelectAddress(item.address);
                          onClose();
                        }}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                          isSelected
                            ? 'bg-rose-50/70 border-rose-600 ring-2 ring-rose-500/20 shadow-xs'
                            : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-xl bg-gray-100 text-gray-600 flex-shrink-0 mt-0.5">
                            {item.type === 'Home' ? (
                              <Home className="w-4 h-4 text-rose-600" />
                            ) : item.type === 'Work' ? (
                              <Briefcase className="w-4 h-4 text-amber-600" />
                            ) : (
                              <MapPin className="w-4 h-4 text-purple-600" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black text-gray-900">{item.type}</span>
                              {isSelected && (
                                <span className="text-[10px] font-black bg-rose-600 text-white px-2 py-0.2 rounded-full">
                                  Current
                                </span>
                              )}
                            </div>
                            <p className="text-xs font-semibold text-gray-600 mt-0.5 line-clamp-2">
                              {item.address}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={(e) => handleDeleteAddress(item.id, e)}
                          className="p-1.5 text-gray-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex-shrink-0"
                          title="Delete address"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ADD NEW ADDRESS FORM */}
          {activeTab === 'add' && (
            <form onSubmit={handleSaveNewAddress} className="space-y-3.5 animate-in fade-in duration-150">
              {/* Address Type Selector */}
              <div>
                <label className="block text-[11px] font-extrabold text-gray-600 uppercase mb-1">
                  Save Address As
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['Home', 'Work', 'Other'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setAddressType(type)}
                      className={`py-2 px-3 rounded-xl border text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 ${
                        addressType === type
                          ? 'bg-rose-50 border-rose-600 text-rose-600 ring-2 ring-rose-500/20'
                          : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {type === 'Home' && <Home className="w-3.5 h-3.5" />}
                      {type === 'Work' && <Briefcase className="w-3.5 h-3.5" />}
                      {type === 'Other' && <MapPin className="w-3.5 h-3.5" />}
                      <span>{type}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Flat / House No */}
              <div>
                <label className="block text-[11px] font-extrabold text-gray-600 mb-1">
                  Flat / House / Building Name *
                </label>
                <input
                  type="text"
                  required
                  value={houseNo}
                  onChange={(e) => setHouseNo(e.target.value)}
                  placeholder="e.g. Flat 402, Sunshine Heights"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              {/* Area / Street */}
              <div>
                <label className="block text-[11px] font-extrabold text-gray-600 mb-1">
                  Area / Street / Sector *
                </label>
                <input
                  type="text"
                  required
                  value={areaStreet}
                  onChange={(e) => setAreaStreet(e.target.value)}
                  placeholder="e.g. 100ft Road, Indiranagar"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              {/* Landmark */}
              <div>
                <label className="block text-[11px] font-extrabold text-gray-600 mb-1">
                  Nearby Landmark (Optional)
                </label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="e.g. Opposite City Metro Station"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              {/* City & Pincode */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-extrabold text-gray-600 mb-1">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Bengaluru"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold text-gray-600 mb-1">Pincode</label>
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="e.g. 560038"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs py-3 rounded-xl shadow-md transition-all active:scale-95"
              >
                Save & Set as Delivery Address
              </button>
            </form>
          )}

        </div>

      </div>
    </div>
  );
}
