import { supabase } from '../config/supabase.js';

/**
 * Returns overall platform KPIs with optional date filtering
 */
export const getPlatformDashboardStats = async (startDate, endDate) => {
  let ordersQuery = supabase.from('orders').select('*');
  
  if (startDate) {
    ordersQuery = ordersQuery.gte('created_at', startDate);
  }
  if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    ordersQuery = ordersQuery.lte('created_at', end.toISOString());
  }

  const { data: allOrders } = await ordersQuery;
  const totalOrdersCount = allOrders?.length || 0;

  // Non-cancelled orders for financial metrics
  const validOrders = allOrders?.filter(o => o.status !== 'CANCELLED') || [];
  
  const totalGMV = validOrders.reduce((acc, o) => acc + (o.total || 0), 0);
  const totalCommission = validOrders.reduce((acc, o) => acc + (o.commission_amount || 0), 0);
  const totalVendorPayouts = validOrders.reduce((acc, o) => acc + (o.vendor_earnings || 0), 0);

  // Active restaurants
  const { data: allRestaurants } = await supabase.from('restaurants').select('*');
  const totalRestaurants = allRestaurants?.length || 0;
  const activeRestaurants = allRestaurants?.filter(r => r.is_open && r.is_approved).length || 0;

  // Active pending/in-progress orders
  const activeOrdersCount = allOrders?.filter(o => 
    ['PENDING', 'PREPARING', 'READY', 'DISPATCHED'].includes(o.status)
  ).length || 0;

  // Delivered vs Total ratio (fulfillment rate)
  const deliveredOrdersCount = allOrders?.filter(o => o.status === 'DELIVERED').length || 0;
  
  const conversionRate = totalOrdersCount > 0 
    ? Math.round((deliveredOrdersCount / totalOrdersCount) * 1000) / 10 
    : 0;

  // Platform global commission rate setting
  const { data: globalSetting } = await supabase
    .from('platform_settings')
    .select('*')
    .eq('key', 'global_commission_rate')
    .single();

  return {
    totalOrders: totalOrdersCount,
    totalGMV: Math.round(totalGMV * 100) / 100,
    totalCommission: Math.round(totalCommission * 100) / 100,
    totalVendorPayouts: Math.round(totalVendorPayouts * 100) / 100,
    totalRestaurants,
    activeRestaurants,
    activeOrdersCount,
    conversionRate,
    globalCommissionRate: globalSetting ? parseFloat(globalSetting.value) : 15.0
  };
};

/**
 * Returns breakdown of orders grouped by restaurant
 */
export const getOrdersByRestaurantAggregates = async (startDate, endDate) => {
  let ordersQuery = supabase.from('orders').select('*');
  
  if (startDate) {
    ordersQuery = ordersQuery.gte('created_at', startDate);
  }
  if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    ordersQuery = ordersQuery.lte('created_at', end.toISOString());
  }

  const { data: filteredOrders } = await ordersQuery;
  const orders = filteredOrders || [];

  // Fetch all restaurants with owner info
  const { data: restaurants } = await supabase
    .from('restaurants')
    .select(`
      *,
      owner:users(id, name, email)
    `);

  // Map and calculate aggregated stats for each restaurant
  const distribution = (restaurants || []).map(rest => {
    const restaurantOrders = orders.filter(o => o.restaurant_id === rest.id);
    const totalOrders = restaurantOrders.length;
    const activeOrders = restaurantOrders.filter(o => ['PENDING', 'PREPARING', 'READY', 'DISPATCHED'].includes(o.status)).length;
    const completedOrders = restaurantOrders.filter(o => o.status === 'DELIVERED').length;
    const cancelledOrders = restaurantOrders.filter(o => o.status === 'CANCELLED').length;

    const validOrders = restaurantOrders.filter(o => o.status !== 'CANCELLED');
    const totalRevenue = validOrders.reduce((acc, o) => acc + (o.total || 0), 0);
    const commissionEarned = validOrders.reduce((acc, o) => acc + (o.commission_amount || 0), 0);
    const vendorPayout = validOrders.reduce((acc, o) => acc + (o.vendor_earnings || 0), 0);

    return {
      restaurantId: rest.id,
      restaurantName: rest.name,
      cuisine: rest.cuisine,
      ownerName: rest.owner?.name || 'Unknown',
      ownerEmail: rest.owner?.email || 'Unknown',
      rating: rest.rating,
      isOpen: rest.is_open,
      isApproved: rest.is_approved,
      commissionRate: rest.commission_rate,
      totalOrders,
      activeOrders,
      completedOrders,
      cancelledOrders,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      commissionEarned: Math.round(commissionEarned * 100) / 100,
      vendorPayout: Math.round(vendorPayout * 100) / 100
    };
  });

  // Sort by revenue descending by default
  distribution.sort((a, b) => b.totalRevenue - a.totalRevenue);

  return distribution;
};
