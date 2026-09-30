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

    if (error) throw error;

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
        userName: r.users?.name || 'Anonymous',
        createdAt: r.created_at
      }))
    });
  } catch (error) {
    console.error('Error fetching ratings:', error);
    res.status(500).json({ error: error.message });
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

    const { data, error } = await supabase
      .from('restaurant_ratings')
      .upsert({
        restaurant_id: parseInt(id),
        user_id: userId,
        rating: parseInt(rating),
        review: review?.trim() || null
      }, { onConflict: 'restaurant_id,user_id' })
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, message: 'Rating submitted successfully!', data });
  } catch (error) {
    console.error('Error submitting rating:', error);
    res.status(500).json({ error: error.message });
  }
};
