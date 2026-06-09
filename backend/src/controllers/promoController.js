import PromoCode from '../models/PromoCode.js';
import Store from '../models/Store.js';

// @desc    Create a new promo code
// @route   POST /api/promos
// @access  Private (Store Admin)
export const createPromoCode = async (req, res) => {
  try {
    const { storeId, code, discountType, discountValue, minPurchase, usageLimit, validUntil } = req.body;

    // Verify admin owns this store
    const store = await Store.findOne({ _id: storeId, ownerId: req.user._id });
    if (!store && req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Not authorized to create promo codes for this store' });
    }

    const promoExists = await PromoCode.findOne({ storeId, code: code.toUpperCase() });
    if (promoExists) {
      return res.status(400).json({ message: 'Promo code already exists for this store' });
    }

    const promoCode = await PromoCode.create({
      storeId,
      code: code.toUpperCase(),
      discountType,
      discountValue,
      minPurchase: minPurchase || 0,
      usageLimit: usageLimit || null,
      validUntil: validUntil || null,
    });

    res.status(201).json(promoCode);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all promo codes for a store
// @route   GET /api/promos/store/:storeId
// @access  Private (Store Admin)
export const getPromoCodes = async (req, res) => {
  try {
    const { storeId } = req.params;

    // Verify admin owns this store
    const store = await Store.findOne({ _id: storeId, ownerId: req.user._id });
    if (!store && req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const promos = await PromoCode.find({ storeId }).sort({ createdAt: -1 });
    res.json(promos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle active status
// @route   PUT /api/promos/:id/toggle
// @access  Private (Store Admin)
export const togglePromoCode = async (req, res) => {
  try {
    const promo = await PromoCode.findById(req.params.id);
    if (!promo) return res.status(404).json({ message: 'Promo not found' });

    // Verify admin owns this store
    const store = await Store.findOne({ _id: promo.storeId, ownerId: req.user._id });
    if (!store && req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    promo.isActive = !promo.isActive;
    await promo.save();
    res.json(promo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete promo code
// @route   DELETE /api/promos/:id
// @access  Private (Store Admin)
export const deletePromoCode = async (req, res) => {
  try {
    const promo = await PromoCode.findById(req.params.id);
    if (!promo) return res.status(404).json({ message: 'Promo not found' });

    // Verify admin owns this store
    const store = await Store.findOne({ _id: promo.storeId, ownerId: req.user._id });
    if (!store && req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await promo.deleteOne();
    res.json({ message: 'Promo code deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update promo code
// @route   PUT /api/promos/:id
// @access  Private (Store Admin)
export const updatePromoCode = async (req, res) => {
  try {
    const promo = await PromoCode.findById(req.params.id);
    if (!promo) return res.status(404).json({ message: 'Promo not found' });

    // Verify admin owns this store
    const store = await Store.findOne({ _id: promo.storeId, ownerId: req.user._id });
    if (!store && req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { code, discountType, discountValue, minPurchase, usageLimit, validUntil } = req.body;

    if (code && code.toUpperCase() !== promo.code) {
      const promoExists = await PromoCode.findOne({ storeId: promo.storeId, code: code.toUpperCase() });
      if (promoExists) {
        return res.status(400).json({ message: 'Promo code already exists for this store' });
      }
      promo.code = code.toUpperCase();
    }

    if (discountType) promo.discountType = discountType;
    if (discountValue !== undefined) promo.discountValue = discountValue;
    if (minPurchase !== undefined) promo.minPurchase = minPurchase;
    if (usageLimit !== undefined) promo.usageLimit = usageLimit;
    if (validUntil !== undefined) promo.validUntil = validUntil;

    const updatedPromo = await promo.save();
    res.json(updatedPromo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Validate a promo code for checkout
// @route   POST /api/promos/validate
// @access  Public
export const validatePromoCode = async (req, res) => {
  try {
    const { storeId, code, orderValue } = req.body;

    if (!storeId || !code || orderValue === undefined) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const promo = await PromoCode.findOne({ storeId, code: code.toUpperCase() });

    if (!promo) {
      return res.status(404).json({ message: 'Invalid promo code' });
    }

    if (!promo.isActive) {
      return res.status(400).json({ message: 'This promo code is no longer active' });
    }

    if (promo.validUntil && new Date() > promo.validUntil) {
      return res.status(400).json({ message: 'This promo code has expired' });
    }

    if (promo.usageLimit && promo.usedCount >= promo.usageLimit) {
      return res.status(400).json({ message: 'This promo code has reached its usage limit' });
    }

    if (orderValue < promo.minPurchase) {
      return res.status(400).json({ message: `Minimum purchase of $${promo.minPurchase} required` });
    }

    let discountAmount = 0;
    if (promo.discountType === 'FIXED') {
      discountAmount = promo.discountValue;
    } else if (promo.discountType === 'PERCENTAGE') {
      discountAmount = (orderValue * promo.discountValue) / 100;
    }

    // Ensure we don't discount more than the order value
    if (discountAmount > orderValue) {
      discountAmount = orderValue;
    }

    res.json({
      valid: true,
      code: promo.code,
      discountAmount: Number(discountAmount.toFixed(2))
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
