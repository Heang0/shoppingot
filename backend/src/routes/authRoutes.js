import express from 'express';
import { authUser, registerUser } from '../controllers/authController.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs for auth routes
  message: 'Too many login attempts from this IP, please try again after 15 minutes',
});

router.post('/register', authLimiter, registerUser);
router.post('/login', authLimiter, authUser);

export default router;
