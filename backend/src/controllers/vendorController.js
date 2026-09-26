import { supabase } from '../config/supabase.js';
import { notifyOrderStatusUpdated } from '../sockets/socketHandler.js';
import { getFilteredOrderLogs, generateCSVReport, generatePDFReport } from '../services/reportService.js';

/**
 * Resolves a vendor's single primary restaurant profile safely without creating duplicates
 */
const getVendorRestaurant = async (userId) => {
  if (!userId) return null;

  // 1. Fetch existing restaurant for this vendor
  const { data: existingList, error } = await supabase
    .from('restaurants')
    .select('*')
    .eq('owner_id', userId)
    .order('id', { ascending: true })
    .limit(1);

  if (existingList && existingList.length > 0) {
    return existingList[0];
  }

  // 2. Check user details
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  
  // If user is Admin viewing vendor portal, fallback to first available restaurant
  if (user && user.role === 'ADMIN') {
    const { data: anyRest } = await supabase
      .from('restaurants')
      .select('*')
      .order('id', { ascending: true })
      .limit(1);
    if (anyRest && anyRest.length > 0) {
      return anyRest[0];
    }
  }

  // 3. Create default profile for the vendor
  if (user) {
    const restName = user.name && !user.name.includes('Customer') 
      ? (user.name.includes('Kitchen') || user.name.includes('Restaurant') ? user.name : `${user.name}'s Kitchen`)
      : 'Spice Route Partner Kitchen';

    const { data: newRestaurant, error: createError } = await supabase
      .from('restaurants')
      .insert({
        name: restName,
        description: 'Authentic Indian & Multi-Cuisine Gourmet Kitchen',
        cuisine: 'Indian & Multi-Cuisine',
        address: user.address || 'Hitec City, Hyderabad',
        phone: user.phone || '+91 98000 00000',
        rating: 4.8,
        is_open: true,
        is_approved: true,
        commission_rate: 15.0,
        image_url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80',
        opening_hours: '10:00 AM - 11:00 PM',
        owner_id: user.id
      })
      .select()
      .single();
    
    if (createError) {
      console.error('Error creating vendor restaurant:', createError);
      return null;
    }

    return newRestaurant;
  }

  return null;
};

export const getVendorProfile = async (req, res) => {
  try {
    const restaurant = await getVendorRestaurant(req.user.id);
    if (!restaurant) {
      return res.status(404).json({ error: 'No restaurant associated with this vendor account' });
    }

    const formatted = {
      id: restaurant.id,
      name: restaurant.name,
      description: restaurant.description,
      cuisine: restaurant.cuisine,
      address: restaurant.address,
      phone: restaurant.phone,
      rating: restaurant.rating || 4.8,
      isOpen: restaurant.is_open ?? true,
      is_open: restaurant.is_open ?? true,
      isApproved: restaurant.is_approved ?? true,
      is_approved: restaurant.is_approved ?? true,
      commissionRate: restaurant.commission_rate ?? 15,
      commission_rate: restaurant.commission_rate ?? 15,
      imageUrl: restaurant.image_url,
      image_url: restaurant.image_url,
      openingHours: restaurant.opening_hours || '10:00 AM - 11:00 PM',
      opening_hours: restaurant.opening_hours || '10:00 AM - 11:00 PM',
      ownerId: restaurant.owner_id,
      owner_id: restaurant.owner_id
    };

    res.json({ success: true, data: formatted });
  } catch (error) {
    console.error('Error fetching vendor profile:', error);
    res.status(500).json({ error: 'Failed to fetch vendor profile' });
  }
};

export const updateVendorProfile = async (req, res) => {
  try {
    const restaurant = await getVendorRestaurant(req.user.id);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    const { name, description, cuisine, address, phone, isOpen, openingHours, imageUrl } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (cuisine) updateData.cuisine = cuisine;
    if (address) updateData.address = address;
    if (phone) updateData.phone = phone;
    if (typeof isOpen === 'boolean') updateData.is_open = isOpen;
    if (openingHours) updateData.opening_hours = openingHours;
    if (imageUrl) updateData.image_url = imageUrl;

    const { data: updated, error: updateErr } = await supabase
      .from('restaurants')
      .update(updateData)
      .eq('id', restaurant.id)
      .select()
      .single();

    if (updateErr) {
      throw updateErr;
    }

    const formatted = {
      id: updated.id,
      name: updated.name,
      description: updated.description,
      cuisine: updated.cuisine,
      address: updated.address,
      phone: updated.phone,
      rating: updated.rating,
      isOpen: updated.is_open ?? true,
      is_open: updated.is_open ?? true,
      isApproved: updated.is_approved ?? true,
      is_approved: updated.is_approved ?? true,
      commissionRate: updated.commission_rate ?? 15,
      commission_rate: updated.commission_rate ?? 15,
      imageUrl: updated.image_url,
      image_url: updated.image_url,
      openingHours: updated.opening_hours,
      opening_hours: updated.opening_hours,
      ownerId: updated.owner_id,
      owner_id: updated.owner_id
    };

    res.json({ success: true, message: 'Restaurant profile updated', data: formatted });
  } catch (error) {
    console.error('Error updating vendor profile:', error);
    res.status(500).json({ error: 'Failed to update restaurant profile' });
  }
};

export const getDeliveryPartners = async (req, res) => {
  try {
    const restaurant = await getVendorRestaurant(req.user.id);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    const { data: partners } = await supabase
      .from('delivery_partners')
      .select('*')
      .eq('restaurant_id', restaurant.id)
      .order('created_at', { ascending: false });

    res.json({ success: true, data: partners || [] });
  } catch (error) {
    console.error('Error fetching delivery partners:', error);
    res.status(500).json({ error: 'Failed to fetch delivery partners' });
  }
};

export const createDeliveryPartner = async (req, res) => {
  try {
    const restaurant = await getVendorRestaurant(req.user.id);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    const { name, phone, vehicleNumber } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ error: 'Driver name and phone number are required' });
    }

    const { data: partner, error: insertErr } = await supabase
      .from('delivery_partners')
      .insert({
        restaurant_id: restaurant.id,
        name,
        phone,
        vehicle_number: vehicleNumber || 'Standard Rider'
      })
      .select()
      .single();

    if (insertErr) throw insertErr;

    res.status(201).json({ success: true, message: 'Delivery partner saved', data: partner });
  } catch (error) {
    console.error('Error creating delivery partner:', error);
    res.status(500).json({ error: 'Failed to save delivery partner' });
  }
};

export const deleteDeliveryPartner = async (req, res) => {
  try {
    const { id } = req.params;
    await supabase
      .from('delivery_partners')
      .delete()
      .eq('id', parseInt(id, 10));
    res.json({ success: true, message: 'Delivery partner removed' });
  } catch (error) {
    console.error('Error deleting delivery partner:', error);
    res.status(500).json({ error: 'Failed to remove delivery partner' });
  }
};

export const getVendorOrders = async (req, res) => {
  try {
    const restaurant = await getVendorRestaurant(req.user.id);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        *,
        customer:users(id, name, phone, address),
        delivery_partner:delivery_partners(*),
        items:order_items(*)
      `)
      .eq('restaurant_id', restaurant.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const formatted = (orders || []).map((o) => ({
      id: o.id,
      orderNumber: o.order_number,
      customerId: o.customer_id,
      restaurantId: o.restaurant_id,
      status: o.status,
      subtotal: o.subtotal,
      deliveryFee: o.delivery_fee,
      tax: o.tax,
      total: o.total,
      commissionRate: o.commission_rate,
      commissionAmount: o.commission_amount,
      vendorEarnings: o.vendor_earnings,
      deliveryAddress: o.delivery_address,
      customerPhone: o.customer_phone,
      notes: o.notes,
      createdAt: o.created_at,
      updatedAt: o.updated_at,
      customer: o.customer || {},
      deliveryPartner: o.delivery_partner || null,
      deliveryPartnerName: o.delivery_partner_name,
      deliveryPartnerPhone: o.delivery_partner_phone,
      items: (o.items || []).map((i) => ({
        id: i.id,
        name: i.name,
        price: i.price,
        quantity: i.quantity
      }))
    }));

    res.json({ success: true, data: formatted });
  } catch (error) {
    console.error('Error fetching vendor orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, deliveryPartnerId, deliveryPartnerName, deliveryPartnerPhone, deliveryPartnerVehicle } = req.body;
    const allowedStatuses = ['PENDING', 'PREPARING', 'READY', 'DISPATCHED', 'DELIVERED', 'CANCELLED'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of [${allowedStatuses.join(', ')}]` });
    }

    const orderId = parseInt(id, 10);
    const { data: existingOrder } = await supabase
      .from('orders')
      .select('*, restaurant:restaurants(*)')
      .eq('id', orderId)
      .maybeSingle();

    if (!existingOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (req.user.role === 'VENDOR') {
      const restaurant = await getVendorRestaurant(req.user.id);
      if (!restaurant || restaurant.id !== existingOrder.restaurant_id) {
        return res.status(403).json({ error: 'Unauthorized to update status for this order' });
      }
    }

    const updateData = { status };

    if (deliveryPartnerId) {
      const { data: partner } = await supabase
        .from('delivery_partners')
        .select('*')
        .eq('id', parseInt(deliveryPartnerId, 10))
        .maybeSingle();
      if (partner) {
        updateData.delivery_partner_id = partner.id;
        updateData.delivery_partner_name = partner.name;
        updateData.delivery_partner_phone = partner.phone;
        updateData.delivery_partner_vehicle = partner.vehicle_number;
      }
    } else if (deliveryPartnerName && deliveryPartnerPhone) {
      updateData.delivery_partner_name = deliveryPartnerName;
      updateData.delivery_partner_phone = deliveryPartnerPhone;
      updateData.delivery_partner_vehicle = deliveryPartnerVehicle || 'Express Courier';
    }

    const { data: updatedOrder, error: updateErr } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId)
      .select(`
        *,
        customer:users(id, name, email, phone),
        restaurant:restaurants(id, name),
        delivery_partner:delivery_partners(*),
        items:order_items(*)
      `)
      .single();

    if (updateErr) throw updateErr;

    notifyOrderStatusUpdated(updatedOrder);

    res.json({ success: true, message: `Order status updated to ${status}`, data: updatedOrder });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
};

export const getVendorMenu = async (req, res) => {
  try {
    const restaurant = await getVendorRestaurant(req.user.id);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    const { data: menuItems, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('restaurant_id', restaurant.id)
      .order('category', { ascending: true });

    if (error) throw error;

    const formatted = (menuItems || []).map((i) => ({
      id: i.id,
      name: i.name,
      description: i.description,
      price: i.price,
      category: i.category || 'Main',
      imageUrl: i.image_url,
      image_url: i.image_url,
      isAvailable: i.is_available ?? true,
      is_available: i.is_available ?? true,
      restaurantId: i.restaurant_id,
      restaurant_id: i.restaurant_id
    }));

    res.json({ success: true, data: formatted });
  } catch (error) {
    console.error('Error fetching vendor menu:', error);
    res.status(500).json({ error: 'Failed to fetch menu items' });
  }
};

export const createMenuItem = async (req, res) => {
  try {
    const restaurant = await getVendorRestaurant(req.user.id);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant profile not found' });
    }

    const { name, description, price, category = 'Main', imageUrl, isAvailable = true } = req.body;
    if (!name || price === undefined) {
      return res.status(400).json({ error: 'Item name and price are required' });
    }

    const { data: item, error: insertErr } = await supabase
      .from('menu_items')
      .insert({
        restaurant_id: restaurant.id,
        name: name.trim(),
        description: description || '',
        price: parseFloat(price),
        category: category || 'Main',
        image_url: imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
        is_available: isAvailable
      })
      .select()
      .single();

    if (insertErr) throw insertErr;

    res.status(201).json({ success: true, message: 'Menu item created successfully', data: item });
  } catch (error) {
    console.error('Error creating menu item:', error);
    res.status(500).json({ error: 'Failed to create menu item' });
  }
};

export const autoPopulateMenu = async (req, res) => {
  try {
    const restaurant = await getVendorRestaurant(req.user.id);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    const presetDishes = [
      {
        name: 'Butter Chicken Gourmet',
        description: 'Tender chicken cooked in velvety tomato butter cream gravy with aromatic herbs.',
        price: 340.00,
        category: 'Main',
        image_url: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=600&auto=format&fit=crop&q=80',
        is_available: true
      },
      {
        name: 'Paneer Butter Masala',
        description: 'Fresh cottage cheese cubes simmered in spiced cashew nut tomato butter gravy.',
        price: 280.00,
        category: 'Main',
        image_url: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&auto=format&fit=crop&q=80',
        is_available: true
      },
      {
        name: 'Hyderabadi Chicken Dum Biryani',
        description: 'Aromatic long-grain basmati rice cooked with marinated chicken and royal whole spices.',
        price: 320.00,
        category: 'Main',
        image_url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80',
        is_available: true
      },
      {
        name: 'Garlic Butter Naan (2 pcs)',
        description: 'Freshly baked tandoori sourdough flatbread brushed with garlic, butter, and coriander.',
        price: 70.00,
        category: 'Sides',
        image_url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80',
        is_available: true
      }
    ];

    const itemsToCreate = presetDishes.map((item) => ({
      ...item,
      restaurant_id: restaurant.id
    }));

    const { data: result, error } = await supabase
      .from('menu_items')
      .insert(itemsToCreate)
      .select();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: `Successfully populated ${result.length} preset menu items!`,
      count: result.length
    });
  } catch (error) {
    console.error('Error auto-populating menu:', error);
    res.status(500).json({ error: 'Failed to populate menu' });
  }
};

export const bulkUploadMenuItems = async (req, res) => {
  try {
    const restaurant = await getVendorRestaurant(req.user.id);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    const { items } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Valid items array is required for bulk upload' });
    }

    const itemsToCreate = items.map((item) => ({
      restaurant_id: restaurant.id,
      name: item.name,
      description: item.description || '',
      price: parseFloat(item.price || 0),
      category: item.category || 'Main',
      image_url: item.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
      is_available: typeof item.isAvailable === 'boolean' ? item.isAvailable : true
    }));

    const { data: result, error: bulkErr } = await supabase
      .from('menu_items')
      .insert(itemsToCreate)
      .select();

    if (bulkErr) throw bulkErr;

    res.status(201).json({
      success: true,
      message: `Successfully imported ${result.length} menu items!`,
      count: result.length
    });
  } catch (error) {
    console.error('Error bulk uploading menu items:', error);
    res.status(500).json({ error: 'Failed to bulk upload menu items' });
  }
};

export const updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const itemId = parseInt(id, 10);
    const { name, description, price, category, imageUrl, isAvailable } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (category) updateData.category = category;
    if (imageUrl !== undefined) updateData.image_url = imageUrl;
    if (typeof isAvailable === 'boolean') updateData.is_available = isAvailable;

    const { data: item, error: updateErr } = await supabase
      .from('menu_items')
      .update(updateData)
      .eq('id', itemId)
      .select()
      .single();

    if (updateErr) throw updateErr;

    res.json({ success: true, message: 'Menu item updated', data: item });
  } catch (error) {
    console.error('Error updating menu item:', error);
    res.status(500).json({ error: 'Failed to update menu item' });
  }
};

export const deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { error: delErr } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', parseInt(id, 10));

    if (delErr) throw delErr;

    res.json({ success: true, message: 'Menu item deleted successfully' });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    res.status(500).json({ error: 'Failed to delete menu item' });
  }
};

export const exportVendorReport = async (req, res) => {
  try {
    const restaurant = await getVendorRestaurant(req.user.id);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    const { startDate, endDate, format = 'csv' } = req.query;
    const orders = await getFilteredOrderLogs({
      startDate,
      endDate,
      restaurantId: restaurant.id.toString()
    });

    const filterInfo = {
      dateRangeLabel: `${restaurant.name} Earnings & Orders`
    };

    if (format.toLowerCase() === 'pdf') {
      return await generatePDFReport(res, orders, filterInfo);
    } else {
      return await generateCSVReport(res, orders, filterInfo);
    }
  } catch (error) {
    console.error('Error exporting vendor report:', error);
    res.status(500).json({ error: 'Failed to generate vendor report' });
  }
};
