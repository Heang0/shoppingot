import express from 'express';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import {
  createPromoCode,
  getPromoCodes,
  togglePromoCode,
  deletePromoCode,
  updatePromoCode,
  validatePromoCode
} from '../controllers/promoController.js';

const router = express.Router();

// Storefront Validate Route
router.post('/validate', validatePromoCode);

// Admin Routes
router.post('/', protect, authorize('store_admin', 'superadmin'), createPromoCode);
router.get('/store/:storeId', protect, authorize('store_admin', 'superadmin'), getPromoCodes);
router.put('/:id/toggle', protect, authorize('store_admin', 'superadmin'), togglePromoCode);
router.put('/:id', protect, authorize('store_admin', 'superadmin'), updatePromoCode);
router.delete('/:id', protect, authorize('store_admin', 'superadmin'), deletePromoCode);

export default router;
