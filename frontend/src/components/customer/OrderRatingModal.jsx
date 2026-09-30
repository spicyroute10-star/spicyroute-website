import React, { useState } from 'react';
import { Star, X, CheckCircle2, Heart, Sparkles, Send } from 'lucide-react';
import { fetchApi } from '../../api/client';

export default function OrderRatingModal({ order, onClose, onRatingSubmitted }) {
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [review, setReview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  if (!order) return null;

  const restaurantId = order.restaurantId || order.restaurant_id || order.restaurant?.id;
  const restaurantName = order.restaurant?.name || 'the restaurant';

  const ratingLabels = {
    1: 'Needs Improvement 😕',
    2: 'Below Average 😐',
    3: 'Good 🙂',
    4: 'Delicious! 😋',
    5: 'Outstanding! 🌟'
  };

  const currentStar = hoveredRating || rating;

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!restaurantId) {
      onClose();
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      await fetchApi(`/restaurants/${restaurantId}/ratings`, {
        method: 'POST',
        body: JSON.stringify({
          rating,
          review: review.trim() || undefined
        })
      });

      // Mark this order as rated in localStorage so it doesn't pop up again
      try {
        localStorage.setItem(`rated_order_${order.id}`, 'true');
      } catch (err) {}

      setSubmitted(true);
      if (onRatingSubmitted) onRatingSubmitted(order.id, rating);

      setTimeout(() => {
        onClose();
      }, 1400);
    } catch (err) {
      setError(err.message || 'Could not submit rating. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDismiss = () => {
    try {
      // Temporarily mark as dismissed so it doesn't immediately re-open on same session
      localStorage.setItem(`rated_order_${order.id}`, 'dismissed');
    } catch (err) {}
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 relative text-center overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="py-6 space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h3 className="text-lg font-black text-gray-900">Thank you!</h3>
            <p className="text-xs font-semibold text-gray-500">
              Your feedback for <span className="text-gray-800 font-bold">{restaurantName}</span> has been shared.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            {/* Delivery badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-black uppercase tracking-wider border border-emerald-200/60">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Order Received</span>
            </div>

            {/* Title */}
            <div>
              <h3 className="text-lg font-black text-gray-900">How was your meal?</h3>
              <p className="text-xs font-semibold text-rose-600 mt-0.5 truncate px-4">
                {restaurantName}
              </p>
              {order.orderNumber && (
                <p className="text-[10px] font-bold text-gray-400 mt-0.5">
                  Order {order.orderNumber}
                </p>
              )}
            </div>

            {/* Star Rating Picker */}
            <div className="py-2">
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="p-1 transition-transform transform active:scale-90 hover:scale-115 focus:outline-none"
                  >
                    <Star
                      className={`w-8 h-8 transition-colors ${
                        star <= currentStar
                          ? 'fill-amber-400 text-amber-400 drop-shadow-sm'
                          : 'fill-gray-100 text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>

              {/* Dynamic feedback text */}
              <p className="text-xs font-bold text-amber-600 mt-2 h-4">
                {ratingLabels[currentStar] || ''}
              </p>
            </div>

            {/* Optional note */}
            <div>
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="What did you like the most? (Optional)"
                rows={2}
                maxLength={200}
                className="w-full text-xs font-medium text-gray-800 placeholder:text-gray-400 bg-gray-50 border border-gray-200 rounded-2xl p-3 resize-none focus:outline-none focus:ring-2 focus:ring-rose-400/50 focus:bg-white transition-all"
              />
            </div>

            {error && (
              <p className="text-[11px] font-bold text-rose-600">{error}</p>
            )}

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white rounded-2xl text-xs font-black shadow-lg shadow-rose-600/20 flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitting ? 'Submitting...' : 'Submit Rating'}</span>
              </button>

              <button
                type="button"
                onClick={handleDismiss}
                className="w-full py-2 text-[11px] font-bold text-gray-400 hover:text-gray-600 transition-colors"
              >
                Maybe Later
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
