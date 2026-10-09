import { 
  getAllCoupons, 
  createCoupon, 
  toggleCouponStatus, 
  deleteCoupon, 
  validateCoupon 
} from '../services/couponService.js';

/**
 * GET /api/coupons/active
 * Customer-facing list of active promotions
 */
export const getActiveCoupons = async (req, res) => {
  try {
    const all = await getAllCoupons();
    const active = all.filter(c => c.isActive).map(c => ({
      code: c.code,
      discountPercent: c.discountPercent,
      description: c.description,
      minOrder: c.minOrder || 0
    }));
    res.json({ success: true, data: active });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * POST /api/coupons/validate
 * Validate coupon code and compute discount for given subtotal
 */
export const validateCouponCode = async (req, res) => {
  try {
    const { code, subtotal } = req.body;
    const result = await validateCoupon(code, subtotal);
    if (!result.valid) {
      return res.status(400).json({ success: false, message: result.message });
    }
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/admin/coupons
 * Admin view of all coupons
 */
export const getAdminCoupons = async (req, res) => {
  try {
    const coupons = await getAllCoupons();
    res.json({ success: true, data: coupons });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * POST /api/admin/coupons
 * Admin creates a new coupon
 */
export const createAdminCoupon = async (req, res) => {
  try {
    const { code, discountPercent, description, minOrder } = req.body;
    const coupon = await createCoupon({ code, discountPercent, description, minOrder });
    res.status(201).json({ success: true, data: coupon });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * PUT /api/admin/coupons/:id/status
 * Admin toggles coupon active state
 */
export const toggleAdminCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    const updated = await toggleCouponStatus(id, isActive);
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * DELETE /api/admin/coupons/:id
 * Admin deletes a coupon
 */
export const deleteAdminCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    await deleteCoupon(id);
    res.json({ success: true, message: 'Coupon deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
