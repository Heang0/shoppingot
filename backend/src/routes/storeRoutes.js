import express from 'express';
import {
  getStores,
  createStore,
  updateStore,
  updatePaymentSettings,
  getStoreBySlug,
} from '../controllers/storeController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getStores)
  .post(protect, createStore);

router.route('/:id')
  .put(protect, updateStore);

router.route('/:id/payment-settings')
  .put(protect, updatePaymentSettings);

router.route('/:slug')
  .get(getStoreBySlug);

export default router;
