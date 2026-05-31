import express from 'express';
import {
  createOrderAndGenerateQR,
  verifyOrderPayment,
  getOrdersForStore,
  getCustomerOrders,
  updateOrderStatus,
} from '../controllers/orderController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createOrderAndGenerateQR);
router.post('/:id/verify', verifyOrderPayment);
router.get('/store', protect, getOrdersForStore);
router.get('/customer', protect, getCustomerOrders);
router.put('/:id/status', protect, updateOrderStatus);

export default router;
