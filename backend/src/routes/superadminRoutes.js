import express from 'express';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import { getDashboardStats, toggleStoreStatus, getAllUsers, updateStoreDomain } from '../controllers/superadminController.js';

const router = express.Router();

router.route('/dashboard')
  .get(protect, authorize('superadmin'), getDashboardStats);

router.route('/stores/:id/toggle')
  .put(protect, authorize('superadmin'), toggleStoreStatus);

router.route('/stores/:id/domain')
  .put(protect, authorize('superadmin'), updateStoreDomain);

router.route('/users')
  .get(protect, authorize('superadmin'), getAllUsers);

export default router;
