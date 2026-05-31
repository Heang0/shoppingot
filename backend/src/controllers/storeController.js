import Store from '../models/Store.js';

// @desc    Get all stores (Superadmin) or User's stores (Store Admin)
// @route   GET /api/stores
// @access  Private
const getStores = async (req, res) => {
  try {
    let stores;
    if (req.user.role === 'superadmin') {
      stores = await Store.find({}).populate('ownerId', 'name email').populate('plan.planId', 'name price');
    } else {
      stores = await Store.find({ ownerId: req.user._id }).populate('ownerId', 'name email').populate('plan.planId', 'name price');
    }
    res.json(stores);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a store (Store Admin setup)
// @route   POST /api/stores
// @access  Private
const createStore = async (req, res) => {
  const { name, slug, branding, category } = req.body;

  try {
    const storeExists = await Store.findOne({ slug });

    if (storeExists) {
      return res.status(400).json({ message: 'Store slug already exists' });
    }

    const store = new Store({
      name,
      slug,
      category: category || 'General Retail',
      ownerId: req.user._id,
      branding,
    });

    const createdStore = await store.save();
    res.status(201).json(createdStore);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update store payment settings
// @route   PUT /api/stores/:id/payment-settings
// @access  Private (Store owner)
const updatePaymentSettings = async (req, res) => {
  const { bakongId, bakongName, currency } = req.body;

  try {
    const store = await Store.findById(req.params.id);

    if (store) {
      if (store.ownerId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to update this store' });
      }

      // Validation for Bakong ID ending with @bkrt or @wing
      if (bakongId && !bakongId.endsWith('@bkrt') && !bakongId.endsWith('@wing')) {
        return res.status(400).json({ message: 'Bakong ID must end with @bkrt or @wing' });
      }

      store.paymentSettings = {
        bakongId: bakongId || store.paymentSettings.bakongId,
        bakongName: bakongName || store.paymentSettings.bakongName,
        currency: currency || store.paymentSettings.currency,
      };

      const updatedStore = await store.save();
      res.json(updatedStore);
    } else {
      res.status(404).json({ message: 'Store not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update store basic info
// @route   PUT /api/stores/:id
// @access  Private (Store owner)
const updateStore = async (req, res) => {
  const { name, slug, branding, category } = req.body;

  try {
    const store = await Store.findById(req.params.id);

    if (store) {
      if (store.ownerId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to update this store' });
      }

      if (slug && slug !== store.slug) {
        const slugExists = await Store.findOne({ slug });
        if (slugExists) return res.status(400).json({ message: 'Store slug already exists' });
      }

      store.name = name || store.name;
      store.slug = slug || store.slug;
      store.category = category || store.category;
      if (branding) store.branding = branding;

      const updatedStore = await store.save();
      res.json(updatedStore);
    } else {
      res.status(404).json({ message: 'Store not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get store details by slug (Public storefront)
// @route   GET /api/stores/:slug
// @access  Public
const getStoreBySlug = async (req, res) => {
  try {
    const store = await Store.findOne({ slug: req.params.slug }).select('-paymentSettings');
    if (store) {
      res.json(store);
    } else {
      res.status(404).json({ message: 'Store not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { getStores, createStore, updateStore, updatePaymentSettings, getStoreBySlug };
