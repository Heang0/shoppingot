import express from 'express';
import { getStoreAnalytics } from '../controllers/analyticsController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getStoreAnalytics);

export default router;
