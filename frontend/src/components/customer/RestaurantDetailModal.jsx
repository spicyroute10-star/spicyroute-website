import React, { useState, useEffect } from 'react';
import { X, Plus, Star, Clock, MapPin, Check, Lock, AlertCircle, Ban, Utensils } from 'lucide-react';
import { fetchApi } from '../../api/client';
import { useCart } from '../../context/CartContext';

export default function RestaurantDetailModal({ restaurantId, onClose, onOpenCart }) {
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [addedItemIds, setAddedItemIds] = useState([]);
  const { addToCart } = useCart();

  useEffect(() => {
    if (!restaurantId) return;
    setLoading(true);
    fetchApi(`/restaurants/${restaurantId}`)
      .then((res) => {
        setRestaurant(res.data);
      })
      .catch((err) => {
        alert('Error loading restaurant menu: ' + err.message);
      })
      .finally(() => setLoading(false));
  }, [restaurantId]);

  if (!restaurantId) return null;

  const rawMenuItems = restaurant?.menuItems || restaurant?.menu_items || [];

  const categories = restaurant
    ? ['All', ...new Set(rawMenuItems.map((i) => i.category || 'Main'))]
    : ['All'];

  const filteredItems = restaurant
    ? selectedCategory === 'All'
      ? rawMenuItems
      : rawMenuItems.filter((i) => (i.category || 'Main') === selectedCategory)
    : [];

  const isRestaurantClosed = restaurant
    ? restaurant.isOpen === false || restaurant.is_open === false
    : false;

  const handleAddItem = (item) => {
    const isItemUnavailable = (item.isAvailable === false || item.is_available === false) || isRestaurantClosed;
    if (isItemUnavailable) return;

    addToCart(item, {
      id: restaurant.id,
      name: restaurant.name,
      imageUrl: restaurant.imageUrl || restaurant.image_url,
      deliveryFee: restaurant.deliveryFee ?? restaurant.delivery_fee ?? 40
    });

    setAddedItemIds((prev) => [...prev, item.id]);
    setTimeout(() => {
      setAddedItemIds((prev) => prev.filter((id) => id !== item.id));
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm overflow-hidden">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-4xl w-full h-[92vh] sm:h-auto sm:max-h-[90vh] lg:h-[88vh] lg:max-h-[88vh] lg:max-w-5xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col my-0 sm:my-auto animate-in slide-in-from-bottom duration-300">
        
        {loading || !restaurant ? (
          <div className="p-12 text-center text-gray-500 font-bold">Loading restaurant menu...</div>
        ) : (
          <>
            {/* Header Image & Info */}
            <div className="relative h-40 sm:h-48 md:h-56 flex-shrink-0 lg:h-56">
              <img
                src={restaurant.imageUrl || restaurant.image_url || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80'}
                alt={restaurant.name}
                className={`w-full h-full object-cover ${isRestaurantClosed ? 'grayscale brightness-75' : ''}`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent"></div>
              
              {/* Translucent Dark Overlay if Restaurant is Closed */}
              {isRestaurantClosed && (
                <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex flex-col items-center justify-center text-white p-3 text-center z-10">
                  <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center mb-1 shadow-xl animate-pulse">
                    <Lock className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-2xl font-black text-red-500 uppercase tracking-widest drop-shadow-md">
                    RESTAURANT CLOSED
                  </h3>
                  <p className="text-[11px] text-gray-200 font-semibold mt-0.5">Operating Hours: {restaurant.openingHours || restaurant.opening_hours}</p>
                </div>
              )}

              <button
                onClick={onClose}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur-md transition-colors z-20"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute bottom-3 left-4 right-4 sm:bottom-4 sm:left-6 sm:right-6 text-white z-20">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-white text-[10px] sm:text-[11px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    isRestaurantClosed ? 'bg-red-600' : 'bg-emerald-600'
                  }`}>
                    {isRestaurantClosed ? 'CLOSED' : 'OPEN'}
                  </span>
                  <span className="bg-white/20 backdrop-blur-md text-white text-[11px] sm:text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-400 text-amber-400" /> {restaurant.rating || '4.8'}
                  </span>
                  <span className="bg-white/20 backdrop-blur-md text-white text-[11px] sm:text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    🛵 {restaurant.deliveryFee === 0 ? 'FREE Delivery' : `₹${restaurant.deliveryFee ?? 40} Delivery`}
                  </span>
                </div>
                <h2 className="text-xl sm:text-3xl font-black truncate">{restaurant.name}</h2>
                <p className="text-[11px] sm:text-xs text-gray-300 font-medium flex items-center gap-2.5 mt-0.5 truncate">
                  <span className="flex items-center gap-1 truncate"><MapPin className="w-3 h-3 flex-shrink-0" /> {restaurant.address}</span>
                  <span className="flex items-center gap-1 flex-shrink-0"><Clock className="w-3 h-3" /> {restaurant.openingHours || restaurant.opening_hours || '10:00 AM - 10:00 PM'}</span>
                </p>
              </div>
            </div>

            {/* Category Tabs */}
            <div className="bg-gray-50 border-b border-gray-200 px-4 sm:px-6 py-2.5 flex gap-2 overflow-x-auto flex-shrink-0 no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1 sm:px-4 sm:py-1.5 rounded-full text-xs font-extrabold transition-all whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Menu Items List */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 md:space-y-0 md:grid md:grid-cols-2 md:gap-4 lg:grid lg:grid-cols-2 lg:gap-4 lg:p-6 lg:auto-rows-fr">
              {filteredItems.length === 0 ? (
                <div className="col-span-full py-12 text-center text-gray-400">
                  <Utensils className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-xs font-bold">No menu items in this category yet.</p>
                </div>
              ) : (
                filteredItems.map((item) => {
                  const isJustAdded = addedItemIds.includes(item.id);
                  const isItemUnavailable = (item.isAvailable === false || item.is_available === false) || isRestaurantClosed;

                  return (
                    <div
                      key={item.id}
                      className={`relative rounded-3xl p-4 sm:p-5 pb-5 sm:pb-6 flex items-start justify-between gap-3 sm:gap-4 border transition-all overflow-hidden bg-white shadow-xs lg:rounded-2xl lg:p-4 lg:min-h-[148px] lg:h-auto lg:items-stretch lg:gap-4 ${
                        isItemUnavailable
                          ? 'border-red-300'
                          : 'border-gray-200/90 hover:shadow-md hover:border-rose-300'
                      }`}
                    >
                      {/* Out of Stock Overlay */}
                      {isItemUnavailable && (
                        <div className="absolute inset-0 bg-black/45 backdrop-blur-[1px] z-10 flex items-center justify-between px-4 border-2 border-red-500/40 rounded-3xl lg:rounded-2xl pointer-events-none">
                          <div className="flex items-center gap-2 text-white">
                            <Ban className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 flex-shrink-0 drop-shadow-md" />
                            <div>
                              <span className="block text-xs sm:text-sm font-black tracking-widest uppercase text-red-500 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] bg-black/60 px-1.5 py-0.5 rounded-md">
                                {isRestaurantClosed ? 'STORE CLOSED' : 'OUT OF STOCK'}
                              </span>
                            </div>
                          </div>

                          <span className="px-2 py-0.5 bg-red-600 text-white rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-wider shadow-lg border border-red-400 flex-shrink-0">
                            {isRestaurantClosed ? 'CLOSED' : 'SOLD OUT'}
                          </span>
                        </div>
                      )}

                      {/* Left Item Details */}
                      <div className="flex-1 min-w-0 pr-1 flex flex-col justify-between self-stretch lg:pr-2 lg:justify-between lg:self-stretch">
                        <div>
                          <h4 className="font-extrabold text-xs sm:text-sm text-gray-900 leading-tight lg:text-sm lg:font-bold lg:line-clamp-2">{item.name}</h4>
                          <p className="text-[11px] sm:text-xs font-medium text-gray-500 line-clamp-2 mt-1 lg:text-xs lg:line-clamp-2 lg:mt-1">
                            {item.description}
                          </p>
                        </div>
                        <div className="text-xs sm:text-sm font-black text-rose-600 mt-3 lg:mt-3 lg:text-sm">
                          ₹{Number(item.price).toFixed(2)}
                        </div>
                      </div>

                      {/* Right Food Image + Add Button Container */}
                      <div className="flex flex-col items-center justify-start gap-2 flex-shrink-0 min-w-[80px] sm:min-w-[96px] lg:w-24 lg:min-w-[96px] lg:justify-between">
                        <img
                          src={item.imageUrl || item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80'}
                          alt={item.name}
                          className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-gray-200 shadow-xs lg:w-24 lg:h-20 lg:rounded-xl"
                        />
                        <button
                          onClick={() => handleAddItem(item)}
                          disabled={isItemUnavailable}
                          className={`w-full py-1.5 px-3 rounded-xl text-[11px] sm:text-xs font-black flex items-center justify-center gap-1 transition-all shadow-sm lg:py-1.5 lg:text-xs ${
                            isItemUnavailable
                              ? 'bg-red-50 border border-red-300 text-red-600 cursor-not-allowed opacity-90'
                              : isJustAdded
                              ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                              : 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20 active:scale-95'
                          }`}
                        >
                          {isItemUnavailable ? (
                            <span className="text-red-600 font-black text-[9px] sm:text-[10px]">OUT OF STOCK</span>
                          ) : isJustAdded ? (
                            <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          ) : (
                            <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          )}
                          {!isItemUnavailable && (isJustAdded ? 'Added' : 'Add')}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
