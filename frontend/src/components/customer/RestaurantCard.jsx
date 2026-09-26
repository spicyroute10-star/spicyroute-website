import React from 'react';
import { Star, Clock, MapPin, ChevronRight, Lock, Tag, Flame } from 'lucide-react';

export default function RestaurantCard({ restaurant, onClick }) {
  const isClosed = !restaurant.isOpen;

  // Generate dynamic Zomato-style promo badge based on restaurant ID
  const discountBadges = [
    '50% OFF up to ₹100',
    'Flat ₹125 OFF',
    'PRO Extra 15% OFF',
    'Free Delivery + ₹50 OFF',
    '20% OFF on Orders > ₹299'
  ];
  const discountText = discountBadges[restaurant.id % discountBadges.length];
  const deliveryMin = 20 + (restaurant.id * 5) % 25;
  const priceForTwo = 200 + (restaurant.id * 80) % 400;

  return (
    <div
      onClick={onClick}
      className={`relative rounded-3xl overflow-hidden border transition-all cursor-pointer group transform hover:-translate-y-1 hover:shadow-2xl ${
        isClosed
          ? 'bg-gray-950 border-red-900/50 shadow-sm'
          : 'bg-white border-gray-200/80 shadow-md hover:border-rose-300'
      }`}
    >
      {/* Cover Image Container */}
      <div className="relative h-48 sm:h-52 overflow-hidden">
        <img
          src={restaurant.imageUrl || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80'}
          alt={restaurant.name}
          className={`w-full h-full object-cover transition-transform duration-500 ${
            isClosed ? 'grayscale opacity-40' : 'group-hover:scale-108'
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent"></div>

        {/* Closed Overlay */}
        {isClosed && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-[2px] flex flex-col items-center justify-center text-white p-4 text-center z-20 border-2 border-red-600/30">
            <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center mb-2 shadow-lg animate-pulse">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-black tracking-widest uppercase text-red-500 drop-shadow-md">
              RESTAURANT CLOSED
            </span>
            <span className="text-[11px] font-semibold text-gray-300 mt-0.5">Currently Not Accepting Orders</span>
          </div>
        )}

        {/* Top Badges: Rating & Status */}
        <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between">
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-md ${
            restaurant.isOpen
              ? 'bg-emerald-600 text-white'
              : 'bg-red-600 text-white'
          }`}>
            {restaurant.isOpen ? 'OPEN NOW' : 'CLOSED'}
          </span>

          {/* Zomato-style Green Rating Badge */}
          <div className="bg-emerald-700 text-white px-2.5 py-1 rounded-xl text-xs font-black shadow-lg flex items-center gap-1 border border-emerald-500/30">
            <span>{restaurant.rating || '4.2'}</span>
            <Star className="w-3 h-3 fill-white text-white" />
          </div>
        </div>

        {/* Bottom Image Overlay: Zomato Offer Badge */}
        {!isClosed && (
          <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between">
            <div className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white px-3 py-1 rounded-xl text-[11px] font-black shadow-lg flex items-center gap-1.5 uppercase tracking-wider">
              <Tag className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
              <span>{discountText}</span>
            </div>
            <span className="text-white/90 text-[11px] font-extrabold bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-xl">
              {deliveryMin} min
            </span>
          </div>
        )}
      </div>

      {/* Card Content Body */}
      <div className={`p-5 relative ${isClosed ? 'bg-gray-950 text-gray-300' : 'bg-white text-gray-900'}`}>
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className={`text-lg font-black tracking-tight leading-snug transition-colors ${
              isClosed ? 'text-gray-300' : 'group-hover:text-rose-600 text-gray-900'
            }`}>
              {restaurant.name}
            </h3>
            <p className={`text-xs font-bold mt-0.5 ${isClosed ? 'text-rose-400/80' : 'text-rose-600'}`}>
              {restaurant.cuisine}
            </p>
          </div>

          <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all flex-shrink-0 mt-0.5 ${
            isClosed ? 'bg-gray-900 text-red-500 border border-red-900/50' : 'bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white shadow-xs'
          }`}>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>

        <p className={`text-xs font-medium line-clamp-2 mt-2 ${isClosed ? 'text-gray-500' : 'text-gray-500'}`}>
          {restaurant.description}
        </p>

        {/* Bottom Details Row */}
        <div className={`mt-4 pt-3 border-t flex items-center justify-between text-xs font-bold ${
          isClosed ? 'border-gray-900 text-gray-500' : 'border-gray-100 text-gray-500'
        }`}>
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
            <span className="truncate max-w-[130px]">{restaurant.address}</span>
          </span>
          <span className="font-extrabold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-lg text-[11px]">
            ₹{priceForTwo} for two
          </span>
        </div>
      </div>
    </div>
  );
}

