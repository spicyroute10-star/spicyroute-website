import express from 'express';
import {
  getDashboardStats,
  getOrdersByRestaurant,
  exportReport,
  updateRestaurantControl,
  updateGlobalCommissionRate,
  onboardVendor,
  deleteRestaurant
} from '../controllers/adminController.js';
import { authenticate } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/rbac.js';

const router = express.Router();

// Strict RBAC: All admin routes require ADMIN role
router.use(authenticate, authorizeRoles('ADMIN'));

router.get('/dashboard-stats', getDashboardStats);
router.get('/orders-by-restaurant', getOrdersByRestaurant);
router.get('/reports/export', exportReport);
router.put('/restaurants/:id/status', updateRestaurantControl);
router.delete('/restaurants/:id', deleteRestaurant);
router.put('/settings/commission', updateGlobalCommissionRate);
router.post('/restaurants/onboard', onboardVendor);

export default router;
