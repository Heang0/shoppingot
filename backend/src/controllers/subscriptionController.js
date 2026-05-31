import SubscriptionPayment from '../models/SubscriptionPayment.js';
import SubscriptionPlan from '../models/SubscriptionPlan.js';
import Store from '../models/Store.js';
import { generateKHQR, verifyKHQRTransaction } from '../services/bakongService.js';

// @desc    Generate QR for Plan Upgrade
// @route   POST /api/subscription/generate-qr
// @access  Private (Store Admin)
const generateSubscriptionQR = async (req, res) => {
  const { planId, storeId } = req.body;

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
    
    // Create pending payment record
    const payment = new SubscriptionPayment({
      storeId,
      planId,
      amount: plan.price,
      currency: 'USD',
      md5Hash: 'pending', // Will update below
    });
    await payment.save();

    // Generate KHQR
    const { md5, qrString } = await generateKHQR(
      superAdminBakongId,
      plan.price,
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
      expiryDate.setDate(expiryDate.getDate() + plan.durationDays);

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

export { generateSubscriptionQR, verifySubscriptionPayment };
