import express from 'express';
import { translateText } from '../controllers/translateController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', protect, translateText);

export default router;
