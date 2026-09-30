import React, { useState, useEffect } from 'react';
import { fetchApi } from '../api/client';
import RestaurantCard from '../components/customer/RestaurantCard';
import RestaurantDetailModal from '../components/customer/RestaurantDetailModal';
import AddressPickerModal from '../components/customer/AddressPickerModal';
import { 
  Search, Mic, Bell, MapPin, ChevronDown, 
  ChevronLeft, ChevronRight, Utensils, 
  Navigation, Loader2, Check 
} from 'lucide-react';

export default function CustomerStorefrontPage({ onOpenCart }) {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Active Delivery Location State
  const [selectedLocation, setSelectedLocation] = useState(() => {
    return localStorage.getItem('user_delivery_address') || 'Select your delivery location';
  });
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [locationSuccess, setLocationSuccess] = useState(false);

  const [activeRestaurantId, setActiveRestaurantId] = useState(null);
  const [bannerIndex, setBannerIndex] = useState(1);

  // Quick GPS Geolocation + Reverse Geocoding via OpenStreetMap / Maps API
  // Quick GPS Geolocation + Reverse Geocoding via BigDataCloud & OpenStreetMap
  const handleQuickLocate = () => {
    setDetectingLocation(true);
    setLocationSuccess(false);

    const onCoordsFound = async (coords) => {
      const { latitude, longitude } = coords;
      let fullAddress = '';

      // 1. BigDataCloud reverse geocode (Free, instant, client-side, CORS allowed)
      try {
        const res = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
        );
        if (res.ok) {
          const data = await res.json();
          const area = data.locality || data.subLocality || data.neighbourhood || '';
          const city = data.city || data.principalSubdivision || '';
          const state = data.principalSubdivision || '';
          const zip = data.postcode || '';
          const parts = [area, city, state, zip].filter(Boolean);
          if (parts.length > 0) fullAddress = [...new Set(parts)].join(', ');
        }
      } catch (err) {}

      // 2. Fallback to OpenStreetMap
      if (!fullAddress) {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`
          );
          if (res.ok) {
            const data = await res.json();
            if (data?.address) {
              const road = data.address.road || data.address.suburb || data.address.neighbourhood || '';
              const locality = data.address.city || data.address.town || data.address.county || '';
              const state = data.address.state || '';
              const parts = [road, locality, state].filter(Boolean);
              if (parts.length > 0) fullAddress = parts.join(', ');
            } else if (data?.display_name) {
              fullAddress = data.display_name.split(',').slice(0, 3).join(', ');
            }
          }
        } catch (err) {}
      }

      if (!fullAddress) {
        fullAddress = `Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
      }

      setSelectedLocation(fullAddress);
      localStorage.setItem('user_delivery_address', fullAddress);
      setLocationSuccess(true);
      setTimeout(() => setLocationSuccess(false), 2500);
      setDetectingLocation(false);
    };

    const fetchIpFallback = async () => {
      try {
        const res = await fetch('https://ipapi.co/json/');
        if (res.ok) {
          const data = await res.json();
          const fallback = `${data.city || 'Local Area'}, ${data.region || ''}, ${data.country_name || 'India'}`;
          setSelectedLocation(fallback);
          localStorage.setItem('user_delivery_address', fallback);
          setLocationSuccess(true);
          setTimeout(() => setLocationSuccess(false), 2500);
        }
      } catch (e) {
        alert('Could not determine location. Please select an address manually.');
      } finally {
        setDetectingLocation(false);
      }
    };

    if (!navigator.geolocation) {
      fetchIpFallback();
      return;
    }

    // Fast lock first
    navigator.geolocation.getCurrentPosition(
      (pos) => onCoordsFound(pos.coords),
      () => {
        // Fallback to high accuracy or IP
        navigator.geolocation.getCurrentPosition(
          (pos) => onCoordsFound(pos.coords),
          () => fetchIpFallback(),
          { enableHighAccuracy: true, timeout: 8000 }
        );
      },
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 }
    );
  };

  const handleSelectAddress = (address) => {
    setSelectedLocation(address);
    localStorage.setItem('user_delivery_address', address);
  };

  // Promotional Banner Carousel Slides
  const bannerSlides = [
    {
      id: 1,
      title: 'Authentic Hyderabadi Biryani',
      subtitle: 'Flat ₹150 OFF on orders above ₹399',
      tag: 'HOT DEAL',
      bgClass: 'from-amber-600 via-rose-600 to-rose-700',
      imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80'
    },
    {
      id: 2,
      title: 'Special Noodle & Asian Delights',
      subtitle: 'Fresh Wok-Tossed Gourmet Noodles & Ramen',
      tag: 'POPULAR',
      bgClass: 'from-amber-500 via-amber-600 to-rose-600',
      imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&auto=format&fit=crop&q=80'
    },
    {
      id: 3,
      title: 'Artisanal Woodfired Pizza',
      subtitle: 'Buy 1 Get 1 Free on Medium Pizzas',
      tag: 'BOGO',
      bgClass: 'from-rose-700 via-rose-600 to-amber-600',
      imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80'
    },
    {
      id: 4,
      title: 'South Indian Special Thali',
      subtitle: 'Complete Balanced Meals with Unlimited Rice',
      tag: 'BESTSELLER',
      bgClass: 'from-amber-700 via-rose-600 to-rose-800',
      imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80'
    },
    {
      id: 5,
      title: 'Craft Wagyu Burgers',
      subtitle: 'Truffle Fries & Hand-spun Milkshakes',
      tag: 'COMBO',
      bgClass: 'from-rose-800 via-rose-600 to-amber-500',
      imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80'
    }
  ];

  // Circular Food Categories
  const foodCategories = [
    {
      id: 'Birayani',
      title: 'Birayani',
      imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=300&auto=format&fit=crop&q=80'
    },
    {
      id: 'Noodle`s & FriedRice',
      title: 'Noodle`s & FriedRice',
      imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=300&auto=format&fit=crop&q=80'
    },
    {
      id: 'Starters',
      title: 'Starters',
      imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=300&auto=format&fit=crop&q=80'
    },
    {
      id: 'Thali',
      title: 'Thali',
      imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300&auto=format&fit=crop&q=80'
    },
    {
      id: 'Curry`s',
      title: 'Curry`s',
      imageUrl: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=300&auto=format&fit=crop&q=80'
    },
    {
      id: 'Chips',
      title: 'Chips & Snacks',
      imageUrl: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&auto=format&fit=crop&q=80'
    },
    {
      id: 'Burgers',
      title: 'Burgers',
      imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&auto=format&fit=crop&q=80'
    },
    {
      id: 'Pizza',
      title: 'Pizza',
      imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&auto=format&fit=crop&q=80'
    }
  ];

  // Dynamic filter for restaurants based on active category
  const filteredRestaurants = (Array.isArray(restaurants) ? restaurants : []).filter((rest) => {
    if (!rest) return false;
    if (selectedCategory === 'All') return true;

    const cuisine = String(rest.cuisine || '').toLowerCase();
    const name = String(rest.name || '').toLowerCase();
    const desc = String(rest.description || '').toLowerCase();
    const text = `${cuisine} ${name} ${desc}`;

    switch (selectedCategory) {
      case 'Birayani':
        return text.includes('biryani') || text.includes('birayani') || text.includes('rice') || text.includes('indian');
      case 'Noodle`s & FriedRice':
        return text.includes('noodle') || text.includes('fried rice') || text.includes('chinese') || text.includes('asian') || text.includes('rice');
      case 'Starters':
        return text.includes('starter') || text.includes('appetizer') || text.includes('kebab') || text.includes('tikka') || text.includes('snack');
      case 'Thali':
        return text.includes('thali') || text.includes('meal') || text.includes('south indian') || text.includes('north indian') || text.includes('indian');
      case 'Curry`s':
        return text.includes('curry') || text.includes('gravy') || text.includes('paneer') || text.includes('masala') || text.includes('indian');
      case 'Chips':
        return text.includes('chip') || text.includes('snack') || text.includes('fast food') || text.includes('chaat') || text.includes('fries');
      case 'Burgers':
        return text.includes('burger') || text.includes('fast food') || text.includes('cafe') || text.includes('sandwich');
      case 'Pizza':
        return text.includes('pizza') || text.includes('italian') || text.includes('fast food') || text.includes('cafe');
      default:
        return text.includes(selectedCategory.toLowerCase());
    }
  });

  const loadRestaurants = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);

      const res = await fetchApi(`/restaurants?${params.toString()}`);
      setRestaurants(res.data || []);
    } catch (err) {
      console.error('Error loading storefront restaurants:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadRestaurants();
    }, 250);
    return () => clearTimeout(timer);
  }, [search]);

  const handleNextBanner = () => {
    setBannerIndex((prev) => (prev % bannerSlides.length) + 1);
  };

  const handlePrevBanner = () => {
    setBannerIndex((prev) => (prev === 1 ? bannerSlides.length : prev - 1));
  };

  const currentBanner = bannerSlides[bannerIndex - 1];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-6 pb-28">
      
      {/* Top Header Location Bar (Swiggy / Zomato / Rapido style) */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-gray-200 shadow-xs">
        
        {/* Clickable Location Selector */}
        <div 
          onClick={() => setIsAddressModalOpen(true)}
          className="flex items-center gap-2.5 max-w-full sm:max-w-[65%] cursor-pointer group"
        >
          <div className="p-2 rounded-xl bg-rose-50 text-rose-600 group-hover:bg-rose-100 transition-colors flex-shrink-0">
            <MapPin className="w-5 h-5 text-rose-600" />
          </div>
          <div className="overflow-hidden">
            <div className="flex items-center gap-1 text-xs font-black text-gray-900 group-hover:text-rose-600 transition-colors">
              <span>Delivering To</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-rose-600" />
            </div>
            <p className="text-xs font-bold text-gray-600 truncate max-w-[220px] sm:max-w-md">
              {selectedLocation}
            </p>
          </div>
        </div>

        {/* Live GPS "Locate Me" & Notification Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleQuickLocate}
            disabled={detectingLocation}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-xs border ${
              locationSuccess
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
            }`}
            title="Detect GPS Current Location"
          >
            {detectingLocation ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-600" />
            ) : locationSuccess ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Navigation className="w-3.5 h-3.5 text-rose-600" />
            )}
            <span className="hidden xs:inline">
              {detectingLocation ? 'Locating...' : locationSuccess ? 'GPS Set!' : 'Locate Me'}
            </span>
          </button>

          {/* Notification Bell Icon */}
          <button className="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-700 transition-colors">
            <Bell className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <div className="flex items-center bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-200">
          <Search className="w-5 h-5 text-rose-600 flex-shrink-0 mr-3" />
          <input
            type="text"
            placeholder="Search for restaurants, dishes, or cuisines..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-xs sm:text-sm font-bold text-gray-900 focus:outline-none placeholder:text-gray-400 placeholder:font-semibold"
          />
          <button className="p-1 text-gray-400 hover:text-rose-600 ml-2">
            <Mic className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Promotional Banner Carousel Slider */}
      <div className="relative rounded-3xl overflow-hidden shadow-lg group">
        <div className={`bg-gradient-to-r ${currentBanner.bgClass} p-6 sm:p-8 text-white min-h-[170px] sm:min-h-[200px] flex items-center justify-between`}>
          <div className="space-y-2 max-w-[60%]">
            <span className="bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider text-amber-200">
              {currentBanner.tag}
            </span>
            <h2 className="text-xl sm:text-3xl font-black tracking-tight leading-tight">{currentBanner.title}</h2>
            <p className="text-xs font-semibold text-rose-100 line-clamp-2">{currentBanner.subtitle}</p>
          </div>

          <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden shadow-xl border-2 border-white/30 flex-shrink-0">
            <img src={currentBanner.imageUrl} alt={currentBanner.title} className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Carousel Slide Counter Tag */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md text-amber-300 text-[11px] font-black px-3 py-0.5 rounded-full">
          {bannerIndex}/{bannerSlides.length}
        </div>

        {/* Carousel Navigation Buttons */}
        <button
          onClick={handlePrevBanner}
          className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={handleNextBanner}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Circular Food Categories */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight">Food Categories</h2>
          {selectedCategory !== 'All' && (
            <button
              onClick={() => setSelectedCategory('All')}
              className="text-xs font-bold text-rose-600 hover:underline"
            >
              Show All
            </button>
          )}
        </div>

        {/* Horizontal Circular Carousel */}
        <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto pb-2 pt-1 no-scrollbar snap-x">
          {foodCategories.map((cat) => {
            const isSelected = selectedCategory === cat.id;

            return (
              <div
                key={cat.id}
                onClick={() => setSelectedCategory(isSelected ? 'All' : cat.id)}
                className="flex flex-col items-center gap-2 cursor-pointer flex-shrink-0 snap-start group"
              >
                <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden p-0.5 transition-all ${
                  isSelected
                    ? 'ring-4 ring-rose-600 shadow-lg'
                    : 'border-2 border-gray-200 group-hover:border-rose-400 shadow-xs'
                }`}>
                  <img
                    src={cat.imageUrl}
                    alt={cat.title}
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&auto=format&fit=crop&q=80';
                    }}
                    className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <span className={`text-xs font-extrabold text-center max-w-[90px] truncate ${
                  isSelected ? 'text-rose-600' : 'text-gray-800 group-hover:text-rose-600'
                }`}>
                  {cat.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Restaurants Showcase */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              Restaurants Near You
            </h2>
            {selectedCategory !== 'All' && (
              <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                Filtered: {selectedCategory}
              </span>
            )}
          </div>

          {selectedCategory !== 'All' && (
            <button
              onClick={() => setSelectedCategory('All')}
              className="text-xs font-black text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-xl transition-colors"
            >
              Clear Filter ✕
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-400 font-bold text-sm flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-rose-600" />
            <span>Finding top restaurants near your location...</span>
          </div>
        ) : filteredRestaurants.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-gray-200 p-8 shadow-xs space-y-3">
            <Utensils className="w-12 h-12 text-rose-300 mx-auto" />
            <h3 className="text-lg font-extrabold text-gray-800">
              {selectedCategory !== 'All'
                ? `No restaurants found under "${selectedCategory}"`
                : 'No restaurants registered yet'}
            </h3>
            <p className="text-xs font-medium text-gray-400 max-w-sm mx-auto">
              {selectedCategory !== 'All'
                ? 'Try picking another category or clear the filter to view all restaurants.'
                : 'Vendors can sign in using their Vendor account to add menus and start receiving orders.'}
            </p>
            {selectedCategory !== 'All' && (
              <button
                onClick={() => setSelectedCategory('All')}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black shadow-md transition-all active:scale-95"
              >
                View All Restaurants
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRestaurants.map((rest) => (
              <RestaurantCard
                key={rest.id}
                restaurant={rest}
                onClick={() => setActiveRestaurantId(rest.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Restaurant Menu Detail Modal */}
      {activeRestaurantId && (
        <RestaurantDetailModal
          restaurantId={activeRestaurantId}
          onClose={() => setActiveRestaurantId(null)}
          onOpenCart={onOpenCart}
        />
      )}

      {/* Interactive Delivery Address Picker Modal */}
      <AddressPickerModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        onSelectAddress={handleSelectAddress}
        currentAddress={selectedLocation}
      />

    </div>
  );
}
