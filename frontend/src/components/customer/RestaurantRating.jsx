import React, { useState, useEffect } from 'react';
import { Star, Send, MessageSquare, User, ThumbsUp } from 'lucide-react';
import { fetchApi } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

function StarPicker({ value, onChange, size = 'w-7 h-7' }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="transition-transform hover:scale-110 active:scale-95"
        >
          <Star
            className={`${size} transition-colors ${
              star <= (hovered || value)
                ? 'fill-amber-400 text-amber-400'
                : 'fill-gray-200 text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function StarDisplay({ value, size = 'w-4 h-4' }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <Star
          key={star}
          className={`${size} ${
            star <= Math.round(value)
              ? 'fill-amber-400 text-amber-400'
              : 'fill-gray-200 text-gray-300'
          }`}
        />
      ))}
    </div>
  );
}

export default function RestaurantRating({ restaurantId, restaurantName }) {
  const { user, token } = useAuth();
  const [ratings, setRatings] = useState([]);
  const [average, setAverage] = useState(null);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [myRating, setMyRating] = useState(0);
  const [myReview, setMyReview] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [showAll, setShowAll] = useState(false);

  const fetchRatings = async () => {
    try {
      const res = await fetchApi(`/restaurants/${restaurantId}/ratings`);
      setRatings(res.ratings || []);
      setAverage(res.average);
      setCount(res.count || 0);
    } catch (e) {
      console.error('Failed to load ratings:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (restaurantId) fetchRatings();
  }, [restaurantId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !token) {
      setError('Please log in to submit a rating.');
      return;
    }
    if (myRating === 0) {
      setError('Please select a star rating.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await fetchApi(`/restaurants/${restaurantId}/ratings`, {
        method: 'POST',
        body: JSON.stringify({ rating: myRating, review: myReview })
      });
      setSubmitted(true);
      setMyRating(0);
      setMyReview('');
      await fetchRatings();
    } catch (e) {
      setError(e.message || 'Failed to submit rating.');
    } finally {
      setSubmitting(false);
    }
  };

  const ratingBreakdown = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: ratings.filter(r => r.rating === star).length,
    pct: count ? Math.round((ratings.filter(r => r.rating === star).length / count) * 100) : 0
  }));

  const visibleRatings = showAll ? ratings : ratings.slice(0, 3);

  return (
    <div className="mt-6 border-t border-gray-100 pt-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center">
          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
        </div>
        <div>
          <h3 className="text-sm font-black text-gray-900">Ratings & Reviews</h3>
          <p className="text-xs text-gray-500">{restaurantName}</p>
        </div>
      </div>

      {/* Summary Row */}
      {!loading && count > 0 && (
        <div className="flex gap-5 bg-amber-50 rounded-2xl p-4 border border-amber-100">
          {/* Big Average */}
          <div className="flex flex-col items-center justify-center min-w-[72px]">
            <span className="text-4xl font-black text-amber-500">{average}</span>
            <StarDisplay value={parseFloat(average)} size="w-3.5 h-3.5" />
            <span className="text-[10px] text-gray-500 font-semibold mt-1">{count} review{count !== 1 ? 's' : ''}</span>
          </div>

          {/* Breakdown bars */}
          <div className="flex-1 space-y-1.5">
            {ratingBreakdown.map(({ star, count: c, pct }) => (
              <div key={star} className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-gray-600 w-3">{star}</span>
                <Star className="w-3 h-3 fill-amber-400 text-amber-400 flex-shrink-0" />
                <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                  <div
                    className="bg-amber-400 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-[10px] font-bold text-gray-400 w-5 text-right">{c}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && count === 0 && (
        <div className="text-center py-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-1" />
          <p className="text-xs font-semibold text-gray-400">No reviews yet. Be the first!</p>
        </div>
      )}

      {/* Submit Rating Form */}
      {user ? (
        submitted ? (
          <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-2xl border border-emerald-200">
            <ThumbsUp className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-emerald-700">Thanks for your review!</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-gray-50 rounded-2xl p-4 border border-gray-200 space-y-3">
            <p className="text-xs font-black text-gray-800 uppercase tracking-wide">Rate this restaurant</p>

            <StarPicker value={myRating} onChange={setMyRating} />

            <textarea
              value={myReview}
              onChange={e => setMyReview(e.target.value)}
              placeholder="Share your experience (optional)..."
              rows={2}
              className="w-full text-xs font-medium text-gray-800 placeholder:text-gray-400 bg-white border border-gray-200 rounded-xl p-3 resize-none focus:outline-none focus:ring-2 focus:ring-amber-400"
            />

            {error && (
              <p className="text-xs font-bold text-rose-600">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting || myRating === 0}
              className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-xs font-black py-2.5 rounded-xl transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              {submitting ? 'Submitting...' : 'Submit Rating'}
            </button>
          </form>
        )
      ) : (
        <div className="flex items-center gap-2 p-3 bg-rose-50 rounded-2xl border border-rose-200">
          <User className="w-4 h-4 text-rose-500" />
          <span className="text-xs font-semibold text-rose-600">Log in to leave a rating</span>
        </div>
      )}

      {/* Reviews List */}
      {visibleRatings.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-black text-gray-500 uppercase tracking-wide">All Reviews</p>
          {visibleRatings.map(r => (
            <div key={r.id} className="bg-white rounded-2xl p-3.5 border border-gray-100 shadow-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-rose-100 flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-rose-600" />
                  </div>
                  <span className="text-xs font-black text-gray-800">{r.userName}</span>
                </div>
                <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-lg">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span className="text-xs font-black text-amber-600">{r.rating}</span>
                </div>
              </div>
              {r.review && (
                <p className="text-xs text-gray-600 font-medium leading-relaxed pl-9">{r.review}</p>
              )}
              <p className="text-[10px] text-gray-400 font-semibold pl-9">
                {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
          ))}

          {ratings.length > 3 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="w-full text-xs font-bold text-amber-600 hover:text-amber-700 py-2 border border-amber-200 rounded-xl hover:bg-amber-50 transition-all"
            >
              {showAll ? 'Show Less' : `View All ${ratings.length} Reviews`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
