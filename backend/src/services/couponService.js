import { supabase } from '../config/supabase.js';

const SYSTEM_COUPONS_EMAIL = 'system_coupons@spicyroute.in';

const DEFAULT_COUPONS = [
  {
    id: 1,
    code: 'SPICY10',
    discountPercent: 10,
    isActive: true,
    description: 'Flat 10% OFF on all campus food orders',
    minOrder: 0,
    maxUses: 0, // 0 = unlimited
    usedCount: 0,
    createdAt: new Date().toISOString()
  }
];

// In-memory cache for ultra-fast validation
let cachedCoupons = null;

const sanitizeCoupons = (list) => {
  return list.map(c => ({
    ...c,
    maxUses: c.maxUses !== undefined ? parseInt(c.maxUses, 10) || 0 : 0,
    usedCount: c.usedCount !== undefined ? parseInt(c.usedCount, 10) || 0 : 0
  }));
};

export const getAllCoupons = async () => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, address')
      .eq('email', SYSTEM_COUPONS_EMAIL)
      .maybeSingle();

    if (error || !user) {
      return cachedCoupons || DEFAULT_COUPONS;
    }

    if (user.address) {
      const parsed = JSON.parse(user.address);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const sanitized = sanitizeCoupons(parsed);
        cachedCoupons = sanitized;
        return sanitized;
      }
    }

    // If empty address, initialize with default
    await saveCouponsToStore(DEFAULT_COUPONS);
    cachedCoupons = DEFAULT_COUPONS;
    return DEFAULT_COUPONS;
  } catch (err) {
    console.error('Error fetching coupons from store:', err);
    return cachedCoupons || DEFAULT_COUPONS;
  }
};

const saveCouponsToStore = async (coupons) => {
  const sanitized = sanitizeCoupons(coupons);
  cachedCoupons = sanitized;
  const serialized = JSON.stringify(sanitized);

  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('email', SYSTEM_COUPONS_EMAIL)
    .maybeSingle();

  if (existing) {
    await supabase
      .from('users')
      .update({ address: serialized })
      .eq('id', existing.id);
  } else {
    await supabase
      .from('users')
      .insert({
        name: 'System Coupon Store',
        email: SYSTEM_COUPONS_EMAIL,
        password: 'system_internal_nopassword',
        role: 'ADMIN',
        address: serialized
      });
  }
};

export const createCoupon = async ({ code, discountPercent, description, minOrder, maxUses }) => {
  const cleanCode = String(code || '').trim().toUpperCase();
  if (!cleanCode) throw new Error('Coupon code is required.');

  const percent = parseFloat(discountPercent);
  if (isNaN(percent) || percent <= 0 || percent > 100) {
    throw new Error('Discount percentage must be between 1 and 100.');
  }

  const coupons = await getAllCoupons();
  if (coupons.some(c => c.code === cleanCode)) {
    throw new Error(`Coupon "${cleanCode}" already exists.`);
  }

  const parsedMaxUses = parseInt(maxUses, 10);
  const finalMaxUses = isNaN(parsedMaxUses) || parsedMaxUses < 0 ? 0 : parsedMaxUses;

  const newCoupon = {
    id: Date.now(),
    code: cleanCode,
    discountPercent: percent,
    isActive: true,
    description: description ? description.trim() : `${percent}% discount on food orders`,
    minOrder: parseFloat(minOrder) || 0,
    maxUses: finalMaxUses, // 0 = unlimited, > 0 = limited to N uses
    usedCount: 0,
    createdAt: new Date().toISOString()
  };

  const updatedList = [newCoupon, ...coupons];
  await saveCouponsToStore(updatedList);
  return newCoupon;
};

export const updateCoupon = async (id, updates = {}) => {
  const coupons = await getAllCoupons();
  const index = coupons.findIndex(c => String(c.id) === String(id));
  if (index === -1) throw new Error('Coupon not found');

  if (updates.maxUses !== undefined) {
    const parsed = parseInt(updates.maxUses, 10);
    coupons[index].maxUses = isNaN(parsed) || parsed < 0 ? 0 : parsed;
  }
  if (updates.minOrder !== undefined) coupons[index].minOrder = parseFloat(updates.minOrder) || 0;
  if (updates.discountPercent !== undefined) {
    const p = parseFloat(updates.discountPercent);
    if (!isNaN(p) && p > 0 && p <= 100) coupons[index].discountPercent = p;
  }
  if (updates.description !== undefined) coupons[index].description = String(updates.description).trim();
  if (updates.isActive !== undefined) coupons[index].isActive = Boolean(updates.isActive);

  await saveCouponsToStore(coupons);
  return coupons[index];
};

export const toggleCouponStatus = async (id, isActive) => {
  const coupons = await getAllCoupons();
  const index = coupons.findIndex(c => String(c.id) === String(id));
  if (index === -1) throw new Error('Coupon not found');

  coupons[index].isActive = Boolean(isActive);
  await saveCouponsToStore(coupons);
  return coupons[index];
};

export const deleteCoupon = async (id) => {
  const coupons = await getAllCoupons();
  const filtered = coupons.filter(c => String(c.id) !== String(id));
  await saveCouponsToStore(filtered);
  return true;
};

export const incrementCouponUsage = async (code) => {
  if (!code) return;
  try {
    const cleanCode = String(code).trim().toUpperCase();
    const coupons = await getAllCoupons();
    const index = coupons.findIndex(c => c.code === cleanCode);
    if (index !== -1) {
      coupons[index].usedCount = (parseInt(coupons[index].usedCount, 10) || 0) + 1;
      await saveCouponsToStore(coupons);
      console.log(`[Coupon] Incremented usage for "${cleanCode}": ${coupons[index].usedCount} / ${coupons[index].maxUses || 'Unlimited'}`);
    }
  } catch (err) {
    console.error('Failed to increment coupon usage:', err);
  }
};

export const validateCoupon = async (code, subtotal = 0) => {
  if (!code) {
    return { valid: false, message: 'Please enter a promo code.' };
  }

  const cleanCode = String(code).trim().toUpperCase();
  const coupons = await getAllCoupons();
  const coupon = coupons.find(c => c.code === cleanCode);

  if (!coupon) {
    return { valid: false, message: 'Invalid coupon code.' };
  }

  if (!coupon.isActive) {
    return { valid: false, message: 'This coupon has expired or is currently inactive.' };
  }

  // Check usage limit
  const maxUses = parseInt(coupon.maxUses, 10) || 0;
  const usedCount = parseInt(coupon.usedCount, 10) || 0;
  if (maxUses > 0 && usedCount >= maxUses) {
    return {
      valid: false,
      message: `Coupon "${cleanCode}" has reached its maximum usage limit of ${maxUses} orders (${usedCount}/${maxUses} used).`
    };
  }

  const numSubtotal = parseFloat(subtotal) || 0;
  if (coupon.minOrder && numSubtotal < coupon.minOrder) {
    return { 
      valid: false, 
      message: `Minimum order amount of ₹${coupon.minOrder} required to apply this coupon.` 
    };
  }

  const discountAmount = Math.round((numSubtotal * (coupon.discountPercent / 100)) * 100) / 100;

  return {
    valid: true,
    coupon: {
      id: coupon.id,
      code: coupon.code,
      discountPercent: coupon.discountPercent,
      description: coupon.description,
      maxUses,
      usedCount
    },
    discountAmount
  };
};
