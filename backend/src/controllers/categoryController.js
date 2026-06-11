import Category from '../models/Category.js';
import Store from '../models/Store.js';
import Product from '../models/Product.js';

export const getCategories = async (req, res) => {
  try {
    const store = await Store.findOne({ ownerId: req.user._id });
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    const categories = await Category.find({ storeId: store._id }).sort({ createdAt: -1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all categories for a specific store (Public)
export const getCategoriesForStore = async (req, res) => {
  try {
    const categories = await Category.find({ storeId: req.params.storeId }).sort({ createdAt: -1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a category
export const createCategory = async (req, res) => {
  try {
    const { name, nameKm } = req.body;
    console.log("CREATE CATEGORY CALLED:", name, "BY USER:", req.user._id);
    
    const store = await Store.findOne({ ownerId: req.user._id });
    if (!store) {
      console.log("STORE NOT FOUND FOR USER");
      return res.status(404).json({ message: 'Store not found' });
    }

    let slug = name.trim().toLowerCase().replace(/\s+/g, '-');
    
    // If somehow empty, generate a random one
    if (!slug) {
      slug = 'category-' + Date.now();
    }
    console.log("SLUG GENERATED:", slug, "FOR STORE:", store._id);

    // Check if category already exists
    const existingCategory = await Category.findOne({ storeId: store._id, slug });
    if (existingCategory) {
      console.log("CATEGORY ALREADY EXISTS");
      return res.status(400).json({ message: 'Category with this name already exists' });
    }

    const category = new Category({
      name,
      nameKm,
      slug,
      storeId: store._id,
    });

    const createdCategory = await category.save();
    console.log("CATEGORY CREATED SUCCESSFULLY:", createdCategory._id);
    res.status(201).json(createdCategory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a category
export const updateCategory = async (req, res) => {
  try {
    const { name, nameKm } = req.body;
    
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const store = await Store.findOne({ ownerId: req.user._id });
    if (!store || category.storeId.toString() !== store._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    let newSlug = name.trim().toLowerCase().replace(/\s+/g, '-');
    if (!newSlug) newSlug = 'category-' + Date.now();

    // Check if another category has this slug
    if (newSlug !== category.slug) {
      const existingCategory = await Category.findOne({ storeId: store._id, slug: newSlug });
      if (existingCategory) {
        return res.status(400).json({ message: 'Category with this name already exists' });
      }
    }

    category.name = name;
    if (nameKm !== undefined) category.nameKm = nameKm;
    category.slug = newSlug;
    const updatedCategory = await category.save();
    
    res.json(updatedCategory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a category
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const store = await Store.findOne({ ownerId: req.user._id });
    if (!store || category.storeId.toString() !== store._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Check if category contains any products
    const associatedProduct = await Product.findOne({ category: category._id });
    if (associatedProduct) {
      return res.status(400).json({
        message: 'Cannot delete category because it contains products. Please remove or reassign them first. / មិនអាចលុបប្រភេទនេះបានទេ ព្រោះវាមានផលិតផលនៅក្នុងនោះ។ សូមលុប ឬផ្លាស់ប្តូរប្រភេទផលិតផលទាំងនោះជាមុនសិន។'
      });
    }

    await category.deleteOne();
    res.json({ message: 'Category removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
