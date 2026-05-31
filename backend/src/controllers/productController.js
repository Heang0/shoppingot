import Product from '../models/Product.js';
import Store from '../models/Store.js';

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

// @desc    Create a product
// @route   POST /api/products
// @access  Private (Store Admin)
const createProduct = async (req, res) => {
  const { storeId, title, description, price, imageUrl, stock, variants } = req.body;

  try {
    const store = await Store.findById(storeId);

    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    if (store.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to add products to this store' });
    }

    const product = new Product({
      storeId,
      title,
      description,
      price,
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1559525839-b184a4d698c7?w=500&q=80', // Default mock image
      stock: stock || 0,
      variants: variants || [],
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

    Object.assign(product, req.body);
    const updatedProduct = await product.save();
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

export { getProductsByStore, createProduct, updateProduct, deleteProduct };
