import express from 'express';
import { getCategories, createCategory, deleteCategory, getCategoriesForStore, updateCategory } from '../controllers/categoryController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/store/:storeId', getCategoriesForStore); // Public

router.route('/')
  .get(protect, getCategories) // Protected
  .post(protect, createCategory); // Create a category

router.route('/:id')
  .put(protect, updateCategory) // Update a category
  .delete(protect, deleteCategory); // Delete a category

export default router;
