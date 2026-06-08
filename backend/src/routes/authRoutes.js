import express from 'express';
import { authUser, registerUser, telegramLogin, linkTelegramAccount } from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs for auth routes
  message: 'Too many login attempts from this IP, please try again after 15 minutes',
});

router.post('/register', authLimiter, registerUser);
router.post('/login', authLimiter, authUser);
router.post('/telegram', telegramLogin);
router.put('/telegram/link', protect, linkTelegramAccount);

export default router;
