import express from 'express';
import {
  generateSubscriptionQR,
  verifySubscriptionPayment,
  simulateSubscriptionPayment,
  activateFreePlan
} from '../controllers/subscriptionController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/generate-qr', protect, generateSubscriptionQR);
router.post('/verify', protect, verifySubscriptionPayment);
router.post('/simulate-pay', simulateSubscriptionPayment);
router.post('/free-plan', protect, activateFreePlan);

export default router;
