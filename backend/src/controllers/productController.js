import Product from '../models/Product.js';
import Store from '../models/Store.js';
import mongoose from 'mongoose';

const generateUniqueSlug = async (title, ProductModel) => {
  let baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  if (!baseSlug) baseSlug = 'product';
  let slug = baseSlug;
  while (await ProductModel.findOne({ slug })) {
    slug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;
  }
  return slug;
};

// @desc    Get all products for a specific store
// @route   GET /api/products/store/:storeId
// @access  Public
const getProductsByStore = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const products = await Product.find({ storeId: req.params.storeId })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
      
    const total = await Product.countDocuments({ storeId: req.params.storeId });

    res.json({
      products,
      page,
      totalPages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get product by ID or Slug
// @route   GET /api/products/:id
// @access  Public
const getProductByIdOrSlug = async (req, res) => {
  try {
    const { id } = req.params;
    let product;

    if (mongoose.isValidObjectId(id)) {
      product = await Product.findById(id);
    }
    
    // If not found by ID, try finding by slug
    if (!product) {
      product = await Product.findOne({ slug: id });
    }

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private (Store Admin)
const createProduct = async (req, res) => {
  const { storeId, title, titleKm, description, descriptionKm, price, imageUrl, images, stock, variants, categoryId } = req.body;

  try {
    const store = await Store.findById(storeId).populate('plan.planId');

    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    if (store.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to add products to this store' });
    }

    // Check plan limits
    const maxProducts = store.plan?.planId?.maxProducts || 0;
    const currentProductCount = await Product.countDocuments({ storeId });
    if (currentProductCount >= maxProducts) {
      return res.status(400).json({ message: `Product limit reached. Your plan allows up to ${maxProducts} products.` });
    }

    const slug = await generateUniqueSlug(title, Product);

    const product = new Product({
      storeId,
      title,
      titleKm,
      slug,
      description,
      descriptionKm,
      price,
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1559525839-b184a4d698c7?w=500&q=80', // Default mock image
      images: images || [],
      stock: stock || 0,
      barcode: req.body.barcode,
      sku: req.body.sku,
      variants: variants || [],
      category: categoryId || undefined,
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private (Store Admin)
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const store = await Store.findById(product.storeId);
    if (store.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this product' });
    }

    if (req.body.title && req.body.title !== product.title) {
      req.body.slug = await generateUniqueSlug(req.body.title, Product);
    }

    const { categoryId, storeId, category, ...updates } = req.body;
    if (Object.prototype.hasOwnProperty.call(req.body, 'categoryId')) {
      if (categoryId) {
        updates.category = categoryId;
      } else {
        updates.$unset = { category: '' };
      }
    }

    const { $unset, ...setUpdates } = updates;
    const updateQuery = { $set: setUpdates };
    if ($unset) updateQuery.$unset = $unset;

    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updateQuery, {
      new: true,
      runValidators: true,
    });
    res.json(updatedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private (Store Admin)
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const store = await Store.findById(product.storeId);
    if (store.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this product' });
    }

    await product.deleteOne();
    res.json({ message: 'Product removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { getProductsByStore, getProductByIdOrSlug, createProduct, updateProduct, deleteProduct };
