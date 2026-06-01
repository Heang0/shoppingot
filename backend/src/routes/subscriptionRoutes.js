import express from 'express';
import {
  generateSubscriptionQR,
  verifySubscriptionPayment,
  simulateSubscriptionPayment
} from '../controllers/subscriptionController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/generate-qr', protect, generateSubscriptionQR);
router.post('/verify', protect, verifySubscriptionPayment);
router.post('/simulate-pay', simulateSubscriptionPayment);

export default router;
