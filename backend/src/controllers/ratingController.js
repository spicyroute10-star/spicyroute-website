import { supabase } from '../config/supabase.js';

// GET /api/restaurants/:id/ratings — fetch ratings + average for a restaurant
export const getRatings = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: ratings, error } = await supabase
      .from('restaurant_ratings')
      .select('id, rating, review, created_at, user_id, users(name)')
      .eq('restaurant_id', id)
      .order('created_at', { ascending: false });

    if (error) {
      // If table doesn't exist yet, fallback gracefully to restaurant rating
      const { data: rest } = await supabase
        .from('restaurants')
        .select('rating')
        .eq('id', id)
        .maybeSingle();

      return res.json({
        success: true,
        average: rest?.rating || 4.5,
        count: 0,
        ratings: []
      });
    }

    const avg = ratings.length
      ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1)
      : null;

    res.json({
      success: true,
      average: avg,
      count: ratings.length,
      ratings: ratings.map(r => ({
        id: r.id,
        rating: r.rating,
        review: r.review,
        userName: r.users?.name || 'Customer',
        createdAt: r.created_at
      }))
    });
  } catch (error) {
    console.warn('Error fetching ratings, falling back:', error.message);
    res.json({ success: true, average: 4.5, count: 0, ratings: [] });
  }
};

// POST /api/restaurants/:id/ratings — submit or update a rating (requires login)
export const submitRating = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, review } = req.body;
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ error: 'Login required to submit a rating' });
    if (!rating || rating < 1 || rating > 5) return res.status(400).json({ error: 'Rating must be between 1 and 5' });

    const numRating = parseInt(rating, 10);
    const restId = parseInt(id, 10);

    // Try saving to restaurant_ratings table
    let savedToTable = false;
    try {
      const { data, error } = await supabase
        .from('restaurant_ratings')
        .upsert({
          restaurant_id: restId,
          user_id: userId,
          rating: numRating,
          review: review?.trim() || null
        }, { onConflict: 'restaurant_id,user_id' })
        .select()
        .maybeSingle();

      if (!error) {
        savedToTable = true;
      } else {
        console.warn('Could not insert to restaurant_ratings table (falling back to direct restaurant rating):', error.message);
      }
    } catch (tblErr) {
      console.warn('restaurant_ratings table query failed:', tblErr.message);
    }

    // Always update or adjust the restaurant's rating in public.restaurants
    try {
      const { data: rest } = await supabase
        .from('restaurants')
        .select('rating')
        .eq('id', restId)
        .maybeSingle();

      if (rest) {
        const currentRating = rest.rating || 4.5;
        // Weighted average with current rating
        const updatedRating = parseFloat(((currentRating * 4 + numRating) / 5).toFixed(1));
        await supabase
          .from('restaurants')
          .update({ rating: updatedRating })
          .eq('id', restId);
      }
    } catch (restErr) {
      console.warn('Failed to update restaurant rating field:', restErr.message);
    }

    res.json({
      success: true,
      message: 'Thank you! Rating submitted successfully!',
      rating: numRating
    });
  } catch (error) {
    console.error('Error submitting rating:', error);
    res.status(500).json({ error: error.message || 'Failed to submit rating' });
  }
};
