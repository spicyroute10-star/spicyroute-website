import { supabase } from '../config/supabase.js';
import { notifyOrderCreated } from '../sockets/socketHandler.js';

/**
 * POST /api/orders
 * Customer places a new order
 */
export const createOrder = async (req, res) => {
  try {
    // Restrict Vendors from ordering food
    if (req.user && req.user.role === 'VENDOR') {
      return res.status(403).json({ error: 'Vendor accounts cannot place food orders. Please sign in as a Customer to order.' });
    }

    const { restaurantId, items, deliveryAddress, customerPhone, notes } = req.body;

    if (!restaurantId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Restaurant ID and at least one item are required' });
    }

    const restId = parseInt(restaurantId, 10);
    const { data: restaurant, error: restError } = await supabase
      .from('restaurants')
      .select('*')
      .eq('id', restId)
      .maybeSingle();

    if (restError || !restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    if (!restaurant.is_open || !restaurant.is_approved) {
      return res.status(400).json({ error: 'This restaurant is currently closed or suspended' });
    }

    // Calculate item costs and subtotal
    let subtotal = 0;
    const orderItemsData = [];

    for (const item of items) {
      let itemPrice = parseFloat(item.price);
      let itemName = item.name;

      if (item.menuItemId || item.id) {
        const itemId = parseInt(item.menuItemId || item.id, 10);
        const { data: menuItem } = await supabase
          .from('menu_items')
          .select('*')
          .eq('id', itemId)
          .maybeSingle();

        if (menuItem) {
          itemPrice = menuItem.price;
          itemName = menuItem.name;
        }
      }

      const qty = parseInt(item.quantity, 10) || 1;
      const itemTotal = itemPrice * qty;
      subtotal += itemTotal;

      orderItemsData.push({
        menu_item_id: item.menuItemId || item.id || null,
        name: itemName,
        price: itemPrice,
        quantity: qty
      });
    }

    // New Business Model:
    // 1. Commission is Application Charges: Fixed ₹5 per item ordered (how many items, that many ₹5).
    // 2. Restaurant menu price is unchanged.
    // 3. Customer pays: subtotal + applicationCharges + deliveryFee.
    // 4. Vendor receives 100% of the food subtotal (0% commission deduction).
    const totalItemCount = orderItemsData.reduce((acc, oi) => acc + oi.quantity, 0);
    const applicationCharges = totalItemCount * 5.0;
    const defaultRestFee = restaurant?.commission_rate !== undefined && restaurant?.commission_rate !== null ? parseFloat(restaurant.commission_rate) : 40.0;
    const deliveryFee = req.body.deliveryFee !== undefined ? parseFloat(req.body.deliveryFee) : defaultRestFee;
    const tax = 0.0;
    const total = Math.round((subtotal + applicationCharges + deliveryFee + tax) * 100) / 100;

    const commissionRate = 0.0; // 0% percentage commission
    const commissionAmount = Math.round(applicationCharges * 100) / 100; // Platform earns ₹5 per item
    const vendorEarnings = Math.round(subtotal * 100) / 100; // Vendor gets full food menu subtotal

    const orderNumber = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;

    const { data: newOrder, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        customer_id: req.user.id,
        restaurant_id: restaurant.id,
        status: 'PENDING',
        subtotal,
        delivery_fee: deliveryFee,
        tax,
        total,
        commission_rate: commissionRate,
        commission_amount: commissionAmount,
        vendor_earnings: vendorEarnings,
        delivery_address: deliveryAddress || req.user.address || 'Standard Delivery Address',
        customer_phone: customerPhone || req.user.phone || '+1 (555) 000-0000',
        notes: notes || ''
      })
      .select()
      .single();

    if (orderError || !newOrder) {
      console.error('Order creation error:', orderError);
      throw new Error(orderError?.message || 'Failed to insert order');
    }

    // Insert order items
    const itemsToInsert = orderItemsData.map((oi) => ({
      order_id: newOrder.id,
      menu_item_id: oi.menu_item_id,
      name: oi.name,
      price: oi.price,
      quantity: oi.quantity
    }));

    const { data: insertedItems } = await supabase
      .from('order_items')
      .insert(itemsToInsert)
      .select();

    const formattedOrder = {
      id: newOrder.id,
      orderNumber: newOrder.order_number,
      customerId: newOrder.customer_id,
      restaurantId: newOrder.restaurant_id,
      status: newOrder.status,
      subtotal: newOrder.subtotal,
      deliveryFee: newOrder.delivery_fee,
      tax: newOrder.tax,
      total: newOrder.total,
      commissionRate: newOrder.commission_rate,
      commissionAmount: newOrder.commission_amount,
      vendorEarnings: newOrder.vendor_earnings,
      deliveryAddress: newOrder.delivery_address,
      customerPhone: newOrder.customer_phone,
      notes: newOrder.notes,
      createdAt: newOrder.created_at,
      updatedAt: newOrder.updated_at,
      customer: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone
      },
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
        address: restaurant.address,
        phone: restaurant.phone,
        imageUrl: restaurant.image_url
      },
      items: insertedItems || []
    };

    // Notify Vendor and Super Admin via WebSockets
    notifyOrderCreated(formattedOrder);

    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      data: formattedOrder
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: error.message || 'Failed to place order' });
  }
};

/**
 * GET /api/orders/my-orders
 * Customer's order history
 */
export const getMyOrders = async (req, res) => {
  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*, order_items(*), restaurants(id, name, image_url, cuisine)')
      .eq('customer_id', req.user.id)
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
      deliveryAddress: o.delivery_address,
      customerPhone: o.customer_phone,
      createdAt: o.created_at,
      restaurant: o.restaurants ? {
        id: o.restaurants.id,
        name: o.restaurants.name,
        imageUrl: o.restaurants.image_url,
        cuisine: o.restaurants.cuisine
      } : null,
      items: o.order_items || []
    }));

    res.json({ success: true, data: formatted });
  } catch (error) {
    console.error('Error fetching customer orders:', error);
    res.status(500).json({ error: 'Failed to fetch your orders' });
  }
};

/**
 * GET /api/orders/:id
 * Live tracker details for a specific order
 */
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const orderId = parseInt(id, 10);

    const { data: o, error } = await supabase
      .from('orders')
      .select('*, order_items(*), restaurants(*), users(id, name, email, phone)')
      .eq('id', orderId)
      .maybeSingle();

    if (error || !o) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const formatted = {
      id: o.id,
      orderNumber: o.order_number,
      customerId: o.customer_id,
      restaurantId: o.restaurant_id,
      status: o.status,
      subtotal: o.subtotal,
      deliveryFee: o.delivery_fee,
      tax: o.tax,
      total: o.total,
      deliveryAddress: o.delivery_address,
      customerPhone: o.customer_phone,
      notes: o.notes,
      createdAt: o.created_at,
      updatedAt: o.updated_at,
      deliveryPartnerName: o.delivery_partner_name,
      deliveryPartnerPhone: o.delivery_partner_phone,
      deliveryPartnerVehicle: o.delivery_partner_vehicle,
      customer: o.users ? {
        id: o.users.id,
        name: o.users.name,
        email: o.users.email,
        phone: o.users.phone
      } : null,
      restaurant: o.restaurants ? {
        id: o.restaurants.id,
        name: o.restaurants.name,
        address: o.restaurants.address,
        phone: o.restaurants.phone,
        imageUrl: o.restaurants.image_url,
        rating: o.restaurants.rating
      } : null,
      items: o.order_items || []
    };

    res.json({ success: true, data: formatted });
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({ error: 'Failed to fetch order details' });
  }
};
