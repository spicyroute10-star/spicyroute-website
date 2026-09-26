import React from 'react';
import { Heart, ShoppingBag, Star, Flame, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function FavouritesPage({ favourites = [], onToggleFavourite, onOpenCart }) {
  const { addItem } = useCart();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-24">
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <Heart className="w-7 h-7 text-rose-600 fill-rose-600" />
            My Favourites
          </h1>
          <p className="text-xs font-semibold text-gray-500 mt-1">
            Your saved dishes & favourite restaurants
          </p>
        </div>
        <span className="bg-rose-100 text-rose-800 text-xs font-black px-3 py-1.5 rounded-full border border-rose-200">
          {favourites.length} Saved
        </span>
      </div>

      {favourites.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-200 p-8 space-y-4">
          <div className="w-16 h-16 bg-rose-50 rounded-full mx-auto flex items-center justify-center text-rose-400">
            <Heart className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-black text-gray-800">No Favourites Saved Yet</h3>
            <p className="text-xs font-medium text-gray-400 mt-1 max-w-sm mx-auto">
              Tap the heart icon on any dish or restaurant card to save it here for instant ordering.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favourites.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="relative h-44 w-full overflow-hidden">
                <img
                  src={item.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80'}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => onToggleFavourite(item)}
                  className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-md rounded-full text-rose-600 shadow-md hover:bg-white transition-transform active:scale-95"
                  title="Remove from favourites"
                >
                  <Heart className="w-4 h-4 fill-rose-600" />
                </button>
                {item.discountTag && (
                  <span className="absolute bottom-3 left-3 bg-rose-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-md">
                    {item.discountTag}
                  </span>
                )}
              </div>

              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-black text-gray-900 text-base leading-tight line-clamp-1">{item.name}</h3>
                  <p className="text-xs font-semibold text-gray-400 line-clamp-2 mt-1">{item.description}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <span className="text-lg font-black text-rose-600">₹{item.price}</span>
                  <button
                    onClick={() => addItem(item)}
                    className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md transition-all active:scale-95"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" /> Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
