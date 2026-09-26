import { supabase } from '../config/supabase.js';

/**
 * GET /api/restaurants
 * Public list of restaurants with optional cuisine and search filters
 */
export const getRestaurants = async (req, res) => {
  try {
    const { search, cuisine } = req.query;

    let query = supabase
      .from('restaurants')
      .select('*, menu_items(id)')
      .eq('is_approved', true)
      .order('rating', { ascending: false });

    if (cuisine && cuisine !== 'All') {
      query = query.ilike('cuisine', `%${cuisine}%`);
    }

    if (search && search.trim()) {
      const s = search.trim();
      query = query.or(`name.ilike.%${s}%,description.ilike.%${s}%,cuisine.ilike.%${s}%`);
    }

    const { data: rawRestaurants, error } = await query;

    if (error) {
      console.error('Supabase getRestaurants error:', error);
      throw error;
    }

    const formatted = (rawRestaurants || []).map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      cuisine: r.cuisine,
      address: r.address,
      phone: r.phone,
      rating: r.rating || 4.5,
      isOpen: r.is_open ?? true,
      is_open: r.is_open ?? true,
      isApproved: r.is_approved ?? true,
      is_approved: r.is_approved ?? true,
      commissionRate: r.commission_rate ?? 15,
      commission_rate: r.commission_rate ?? 15,
      imageUrl: r.image_url,
      image_url: r.image_url,
      openingHours: r.opening_hours || '10:00 AM - 10:00 PM',
      opening_hours: r.opening_hours || '10:00 AM - 10:00 PM',
      ownerId: r.owner_id,
      owner_id: r.owner_id,
      menuItemsCount: r.menu_items ? r.menu_items.length : 0,
      _count: {
        menuItems: r.menu_items ? r.menu_items.length : 0
      }
    }));

    res.json({ success: true, data: formatted });
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    res.status(500).json({ error: 'Failed to fetch restaurants' });
  }
};

/**
 * GET /api/restaurants/:id
 * Detailed view of restaurant and its full menu (including out-of-stock items)
 */
export const getRestaurantDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const restId = parseInt(id, 10);

    const { data: r, error: restError } = await supabase
      .from('restaurants')
      .select('*')
      .eq('id', restId)
      .maybeSingle();

    if (restError || !r) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    const { data: items, error: itemsError } = await supabase
      .from('menu_items')
      .select('*')
      .eq('restaurant_id', restId)
      .order('category', { ascending: true });

    const formattedItems = (items || []).map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category || 'Main',
      imageUrl: item.image_url,
      image_url: item.image_url,
      isAvailable: item.is_available ?? true,
      is_available: item.is_available ?? true,
      restaurantId: item.restaurant_id,
      restaurant_id: item.restaurant_id
    }));

    const formatted = {
      id: r.id,
      name: r.name,
      description: r.description,
      cuisine: r.cuisine,
      address: r.address,
      phone: r.phone,
      rating: r.rating || 4.5,
      isOpen: r.is_open ?? true,
      is_open: r.is_open ?? true,
      isApproved: r.is_approved ?? true,
      is_approved: r.is_approved ?? true,
      commissionRate: r.commission_rate ?? 15,
      commission_rate: r.commission_rate ?? 15,
      imageUrl: r.image_url,
      image_url: r.image_url,
      openingHours: r.opening_hours || '10:00 AM - 10:00 PM',
      opening_hours: r.opening_hours || '10:00 AM - 10:00 PM',
      ownerId: r.owner_id,
      owner_id: r.owner_id,
      menuItems: formattedItems
    };

    res.json({ success: true, data: formatted });
  } catch (error) {
    console.error('Error fetching restaurant details:', error);
    res.status(500).json({ error: 'Failed to fetch restaurant details' });
  }
};
