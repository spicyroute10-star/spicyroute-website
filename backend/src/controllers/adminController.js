import { supabase } from '../config/supabase.js';
import { getPlatformDashboardStats, getOrdersByRestaurantAggregates } from '../services/analyticsService.js';
import { getFilteredOrderLogs, generateCSVReport, generatePDFReport } from '../services/reportService.js';
import bcrypt from 'bcryptjs';

/**
 * GET /api/admin/dashboard-stats
 * Aggregated platform metrics
 */
export const getDashboardStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const stats = await getPlatformDashboardStats(startDate, endDate);
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error fetching admin dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard metrics' });
  }
};

/**
 * GET /api/admin/orders-by-restaurant
 * Group orders by restaurant using database aggregates
 */
export const getOrdersByRestaurant = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const distribution = await getOrdersByRestaurantAggregates(startDate, endDate);
    res.json({ success: true, data: distribution });
  } catch (error) {
    console.error('Error fetching orders by restaurant:', error);
    res.status(500).json({ error: 'Failed to fetch restaurant order distribution' });
  }
};

/**
 * GET /api/admin/reports/export
 * Downloads CSV or PDF exportable sales/order logs report
 */
export const exportReport = async (req, res) => {
  try {
    const { startDate, endDate, restaurantId, format = 'csv' } = req.query;

    const orders = await getFilteredOrderLogs({ startDate, endDate, restaurantId });

    const filterInfo = {
      dateRangeLabel: startDate && endDate ? `${startDate} to ${endDate}` : startDate ? `From ${startDate}` : endDate ? `Until ${endDate}` : 'All Time'
    };

    if (format.toLowerCase() === 'pdf') {
      return await generatePDFReport(res, orders, filterInfo);
    } else {
      return await generateCSVReport(res, orders, filterInfo);
    }
  } catch (error) {
    console.error('Error exporting report:', error);
    res.status(500).json({ error: 'Failed to generate report export' });
  }
};

/**
 * PUT /api/admin/restaurants/:id/status
 * Approve, suspend, or update commission rate for a vendor
 */
export const updateRestaurantControl = async (req, res) => {
  try {
    const { id } = req.params;
    const { isApproved, isOpen, commissionRate, deliveryFee } = req.body;

    const dataToUpdate = {};
    if (typeof isApproved === 'boolean') dataToUpdate.is_approved = isApproved;
    if (typeof isOpen === 'boolean') dataToUpdate.is_open = isOpen;
    if (deliveryFee !== undefined && !isNaN(parseFloat(deliveryFee))) {
      dataToUpdate.commission_rate = Math.max(0, parseFloat(deliveryFee));
    } else if (commissionRate !== undefined && !isNaN(parseFloat(commissionRate))) {
      dataToUpdate.commission_rate = parseFloat(commissionRate);
    }

    const { data: updatedRestaurant } = await supabase
      .from('restaurants')
      .update(dataToUpdate)
      .eq('id', parseInt(id, 10))
      .select()
      .single();

    // Get owner information
    const { data: owner } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('id', updatedRestaurant.owner_id)
      .single();

    res.json({
      success: true,
      message: 'Restaurant controls updated successfully',
      data: { ...updatedRestaurant, owner }
    });
  } catch (error) {
    console.error('Error updating restaurant status:', error);
    res.status(500).json({ error: 'Failed to update restaurant settings' });
  }
};

/**
 * PUT /api/admin/settings/commission
 * Update global platform commission rate
 */
export const updateGlobalCommissionRate = async (req, res) => {
  try {
    const { commissionRate } = req.body;
    if (commissionRate === undefined || isNaN(parseFloat(commissionRate))) {
      return res.status(400).json({ error: 'Valid commissionRate number is required' });
    }

    const rateStr = parseFloat(commissionRate).toString();

    await supabase
      .from('platform_settings')
      .upsert({
        key: 'global_commission_rate',
        value: rateStr
      });

    res.json({
      success: true,
      message: `Global platform commission rate updated to ${rateStr}%`
    });
  } catch (error) {
    console.error('Error updating global commission:', error);
    res.status(500).json({ error: 'Failed to update global commission rate' });
  }
};

/**
 * POST /api/admin/restaurants/onboard
 * Admin directly onboards a new vendor and restaurant
 */
export const onboardVendor = async (req, res) => {
  try {
    const { ownerName, ownerEmail, ownerPassword, restaurantName, cuisine, address, phone, commissionRate = 15.0 } = req.body;

    // Require either email+password OR phone for vendor onboarding
    if (!restaurantName) {
      return res.status(400).json({ error: 'Restaurant name is required for vendor onboarding' });
    }

    if ((!ownerEmail || !ownerPassword) && !phone) {
      return res.status(400).json({ error: 'Either email+password OR phone number is required for vendor onboarding' });
    }

    let vendorUser;
    let loginMethod;

    if (phone) {
      // Phone-based login (OTP)
      loginMethod = 'phone';
      const cleanPhone = phone.trim().replace(/\s+/g, '');

      // Check if user already exists with this phone
      let { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('phone', cleanPhone)
        .single();

      if (!existingUser) {
        // Create new vendor user with phone number
        const hashedPassword = await bcrypt.hash(ownerPassword || 'password123', 10);
        const userEmail = ownerEmail || `vendor_${cleanPhone}@spiceroute.com`;
        
        const { data: newUser } = await supabase
          .from('users')
          .insert({
            name: ownerName || restaurantName + ' Owner',
            email: userEmail,
            password: hashedPassword,
            role: 'VENDOR',
            phone: cleanPhone,
            address: address || 'Current Location'
          })
          .select()
          .single();
        
        vendorUser = newUser;
      } else {
        // Update existing user to vendor role if needed
        if (existingUser.role !== 'VENDOR') {
          const { data: updatedUser } = await supabase
            .from('users')
            .update({ role: 'VENDOR' })
            .eq('id', existingUser.id)
            .select()
            .single();
          vendorUser = updatedUser;
        } else {
          vendorUser = existingUser;
        }
      }
    } else {
      // Email-based login
      loginMethod = 'email';
      
      // Check if user already exists with this email
      let { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('email', ownerEmail)
        .single();

      if (!existingUser) {
        // Create new vendor user with email/password
        const hashedPassword = await bcrypt.hash(ownerPassword, 10);
        
        const { data: newUser } = await supabase
          .from('users')
          .insert({
            name: ownerName || restaurantName + ' Owner',
            email: ownerEmail,
            password: hashedPassword,
            role: 'VENDOR',
            phone: phone || null,
            address: address || 'Current Location'
          })
          .select()
          .single();
        
        vendorUser = newUser;
      } else {
        // Update existing user to vendor role if needed
        if (existingUser.role !== 'VENDOR') {
          const { data: updatedUser } = await supabase
            .from('users')
            .update({ role: 'VENDOR' })
            .eq('id', existingUser.id)
            .select()
            .single();
          vendorUser = updatedUser;
        } else {
          vendorUser = existingUser;
        }
      }
    }

    // Create restaurant for the vendor
    const { data: restaurant } = await supabase
      .from('restaurants')
      .insert({
        name: restaurantName,
        cuisine: cuisine || 'General Cuisine',
        address: address || '123 Business St',
        phone: phone || vendorUser.phone || '+1 (555) 000-0000',
        commission_rate: parseFloat(commissionRate),
        is_approved: true,
        is_open: true,
        owner_id: vendorUser.id,
        image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80'
      })
      .select()
      .single();

    const loginInfo = {
      role: 'VENDOR',
      method: loginMethod
    };

    if (loginMethod === 'phone') {
      loginInfo.phone = vendorUser.phone;
      loginInfo.testOtp = '1234';
    } else {
      loginInfo.email = vendorUser.email;
      loginInfo.password = ownerPassword; // Return the password for testing
    }

    res.status(201).json({
      success: true,
      message: 'Vendor and restaurant onboarded successfully',
      data: { 
        vendorUser: {
          ...vendorUser,
          phone: vendorUser.phone
        }, 
        restaurant 
      },
      loginInfo
    });
  } catch (error) {
    console.error('Error onboarding vendor:', error);
    res.status(500).json({ error: 'Failed to onboard vendor: ' + error.message });
  }
};

/**
 * DELETE /api/admin/restaurants/:id
 * Permanently delete a restaurant and its related records (rejection/deletion)
 */
export const deleteRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    const restaurantId = parseInt(id, 10);

    if (isNaN(restaurantId)) {
      return res.status(400).json({ error: 'Invalid restaurant ID' });
    }

    // 1. Fetch restaurant to verify existence and get owner_id
    const { data: restaurant, error: fetchErr } = await supabase
      .from('restaurants')
      .select('id, name, owner_id')
      .eq('id', restaurantId)
      .single();

    if (fetchErr || !restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    // 2. Delete ratings / reviews
    await supabase
      .from('restaurant_ratings')
      .delete()
      .eq('restaurant_id', restaurantId);

    // 3. Delete order items for orders from this restaurant
    const { data: restaurantOrders } = await supabase
      .from('orders')
      .select('id')
      .eq('restaurant_id', restaurantId);

    if (restaurantOrders && restaurantOrders.length > 0) {
      const orderIds = restaurantOrders.map(o => o.id);
      await supabase
        .from('order_items')
        .delete()
        .in('order_id', orderIds);

      // Delete orders
      await supabase
        .from('orders')
        .delete()
        .eq('restaurant_id', restaurantId);
    }

    // 4. Delete menu items
    await supabase
      .from('menu_items')
      .delete()
      .eq('restaurant_id', restaurantId);

    // 5. Delete delivery partners
    await supabase
      .from('delivery_partners')
      .delete()
      .eq('restaurant_id', restaurantId);

    // 6. Delete the restaurant record
    const { error: deleteErr } = await supabase
      .from('restaurants')
      .delete()
      .eq('id', restaurantId);

    if (deleteErr) {
      console.error('Error deleting restaurant:', deleteErr);
      throw deleteErr;
    }

    // 7. Check if owner has any remaining restaurants. If not, revert user role back to CUSTOMER
    if (restaurant.owner_id) {
      const { data: remainingRestaurants } = await supabase
        .from('restaurants')
        .select('id')
        .eq('owner_id', restaurant.owner_id);

      if (!remainingRestaurants || remainingRestaurants.length === 0) {
        await supabase
          .from('users')
          .update({ role: 'CUSTOMER' })
          .eq('id', restaurant.owner_id);
      }
    }

    res.json({
      success: true,
      message: `Restaurant "${restaurant.name}" has been permanently deleted.`
    });
  } catch (error) {
    console.error('Error in deleteRestaurant:', error);
    res.status(500).json({ error: 'Failed to delete restaurant: ' + (error.message || error) });
  }
};
