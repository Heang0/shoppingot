import express from 'express';
import { updateUserProfile, addAddress, updateAddress, deleteAddress, setDefaultAddress, toggleFavorite, getFavorites } from '../controllers/userController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/profile')
  .put(protect, updateUserProfile);

router.post('/addresses', protect, addAddress);
router.put('/addresses/:id', protect, updateAddress);
router.delete('/addresses/:id', protect, deleteAddress);
router.put('/addresses/:id/default', protect, setDefaultAddress);

router.get('/favorites', protect, getFavorites);
router.post('/favorites/:productId', protect, toggleFavorite);

export default router;
