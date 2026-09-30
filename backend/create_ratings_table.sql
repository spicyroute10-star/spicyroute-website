-- Create restaurant_ratings table
CREATE TABLE IF NOT EXISTS public.restaurant_ratings (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(restaurant_id, user_id)
);

-- Allow reading ratings publicly
ALTER TABLE public.restaurant_ratings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read ratings" ON public.restaurant_ratings FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert ratings" ON public.restaurant_ratings FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own ratings" ON public.restaurant_ratings FOR UPDATE USING (true);
