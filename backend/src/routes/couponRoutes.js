import express from 'express';
import { getActiveCoupons, validateCouponCode } from '../controllers/couponController.js';

const router = express.Router();

router.get('/active', getActiveCoupons);
router.post('/validate', validateCouponCode);

export default router;
