import express from 'express';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import { getDashboardStats, toggleStoreStatus } from '../controllers/superadminController.js';

const router = express.Router();

router.route('/dashboard')
  .get(protect, authorize('superadmin'), getDashboardStats);

router.route('/stores/:id/toggle')
  .put(protect, authorize('superadmin'), toggleStoreStatus);

export default router;
