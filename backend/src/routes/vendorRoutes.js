import express from 'express';
import {
  getVendorProfile,
  updateVendorProfile,
  getVendorOrders,
  updateOrderStatus,
  getVendorMenu,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  bulkUploadMenuItems,
  autoPopulateMenu,
  exportVendorReport,
  getDeliveryPartners,
  createDeliveryPartner,
  deleteDeliveryPartner
} from '../controllers/vendorController.js';
import { authenticate } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/rbac.js';

const router = express.Router();

router.use(authenticate, authorizeRoles('VENDOR', 'ADMIN'));

router.get('/profile', getVendorProfile);
router.put('/profile', updateVendorProfile);

router.get('/orders', getVendorOrders);
router.put('/orders/:id/status', updateOrderStatus);

router.get('/menu', getVendorMenu);
router.post('/menu', createMenuItem);
router.post('/menu/auto-populate', autoPopulateMenu);
router.post('/menu/bulk-upload', bulkUploadMenuItems);
router.put('/menu/:id', updateMenuItem);
router.delete('/menu/:id', deleteMenuItem);

router.get('/delivery-partners', getDeliveryPartners);
router.post('/delivery-partners', createDeliveryPartner);
router.delete('/delivery-partners/:id', deleteDeliveryPartner);

router.get('/reports/export', exportVendorReport);

export default router;
