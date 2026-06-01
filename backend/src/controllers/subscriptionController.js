import SubscriptionPayment from '../models/SubscriptionPayment.js';
import SubscriptionPlan from '../models/SubscriptionPlan.js';
import Store from '../models/Store.js';
import { generateKHQR, verifyKHQRTransaction } from '../services/bakongService.js';

// @desc    Generate QR for Plan Upgrade
// @route   POST /api/subscription/generate-qr
// @route   POST /api/subscription/generate-qr
// @access  Private (Store Admin)
const generateSubscriptionQR = async (req, res) => {
  const { planId, storeId, billingCycle = 'monthly' } = req.body;

  try {
    const plan = await SubscriptionPlan.findById(planId);
    const store = await Store.findById(storeId);

    if (!plan || !store) {
      return res.status(404).json({ message: 'Plan or Store not found' });
    }

    if (store.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const superAdminBakongId = process.env.SUPERADMIN_BAKONG_ID;
    
    // Calculate price
    let amount = plan.price;
    if (billingCycle === 'annually') {
      let discountRate = 1; // Free or other
      if (plan.name === 'Pro') discountRate = 0.8; // 20% discount
      else if (plan.name === 'Premium') discountRate = 0.7; // 30% discount
      amount = Number((plan.price * 12 * discountRate).toFixed(2));
    }

    // Create pending payment record
    const payment = new SubscriptionPayment({
      storeId,
      planId,
      amount,
      currency: 'USD',
      billingCycle,
      md5Hash: 'pending', // Will update below
    });
    await payment.save();

    // Generate KHQR
    const { md5, qrString } = await generateKHQR(
      superAdminBakongId,
      amount,
      'USD',
      payment._id.toString()
    );

    payment.md5Hash = md5;
    await payment.save();

    res.json({
      qrString,
      md5,
      paymentId: payment._id,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify KHQR Transaction
// @route   POST /api/subscription/verify
// @access  Private (Store Admin)
const verifySubscriptionPayment = async (req, res) => {
  const { paymentId, md5 } = req.body;

  try {
    const payment = await SubscriptionPayment.findById(paymentId);

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    if (payment.status === 'PAID') {
      return res.json({ status: 'PAID' });
    }

    const verification = await verifyKHQRTransaction(md5);

    if (verification.status === 0) {
      payment.status = 'PAID';
      payment.paidAt = Date.now();
      await payment.save();

      // Upgrade the store plan
      const store = await Store.findById(payment.storeId);
      const plan = await SubscriptionPlan.findById(payment.planId);
      
      const expiryDate = new Date();
      if (payment.billingCycle === 'annually') {
        expiryDate.setDate(expiryDate.getDate() + 365);
      } else {
        expiryDate.setDate(expiryDate.getDate() + plan.durationDays);
      }

      store.plan = {
        planId: plan._id,
        expiresAt: expiryDate,
        isActive: true,
      };
      await store.save();

      return res.json({ status: 'PAID', store });
    }

    res.json({ status: 'PENDING' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Simulate Webhook Payment (DEV ONLY)
// @route   POST /api/subscription/simulate-pay
// @access  Public
const simulateSubscriptionPayment = async (req, res) => {
  const { paymentId } = req.body;
  try {
    const payment = await SubscriptionPayment.findById(paymentId);
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    
    payment.status = 'PAID';
    payment.paidAt = Date.now();
    await payment.save();

    const store = await Store.findById(payment.storeId);
    const plan = await SubscriptionPlan.findById(payment.planId);
    
    const expiryDate = new Date();
    if (payment.billingCycle === 'annually') {
      expiryDate.setDate(expiryDate.getDate() + 365);
    } else {
      expiryDate.setDate(expiryDate.getDate() + plan.durationDays);
    }

    store.plan = {
      planId: plan._id,
      expiresAt: expiryDate,
      isActive: true,
    };
    await store.save();

    res.json({ message: 'Simulated payment success' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Activate Free Plan directly
// @route   POST /api/subscription/free-plan
// @access  Private (Merchant)
const activateFreePlan = async (req, res) => {
  const { planId } = req.body;
  try {
    const store = await Store.findOne({ ownerId: req.user._id }).populate('plan.planId');
    if (!store) return res.status(404).json({ message: 'Store not found' });

    // Prevent overwriting an active paid plan
    if (store.plan && store.plan.planId && store.plan.planId.price > 0 && store.plan.expiresAt > new Date()) {
      return res.status(400).json({ message: 'You already have an active paid plan. It will revert to the free plan upon expiration.' });
    }

    const plan = await SubscriptionPlan.findById(planId);
    if (!plan) return res.status(404).json({ message: 'Plan not found' });
    if (plan.price > 0) return res.status(400).json({ message: 'This plan is not free' });

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + plan.durationDays);

    store.plan = {
      planId: plan._id,
      expiresAt: expiryDate,
      isActive: true,
    };
    await store.save();

    res.json({ status: 'SUCCESS', store });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { generateSubscriptionQR, verifySubscriptionPayment, simulateSubscriptionPayment, activateFreePlan };
