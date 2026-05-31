import express from 'express';
import {
  getPlans,
  createPlan,
  updatePlan,
  deletePlan,
} from '../controllers/planController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getPlans)
  .post(protect, authorize('superadmin'), createPlan);

router.route('/:id')
  .put(protect, authorize('superadmin'), updatePlan)
  .delete(protect, authorize('superadmin'), deletePlan);

export default router;
