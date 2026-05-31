import Store from '../models/Store.js';
import Order from '../models/Order.js'; // Assuming we want to calculate revenue from orders? Wait, subscription revenue.
// We don't have a Subscription model tracking payments natively yet? The Store model has `plan.isActive`.
// For dashboard stats, we'll calculate basic metrics.

// @desc    Get dashboard stats
// @route   GET /api/superadmin/dashboard
// @access  Private/Superadmin
export const getDashboardStats = async (req, res) => {
  try {
    const totalStores = await Store.countDocuments();
    
    // Active subscriptions are stores with plan.isActive = true
    const activeSubscriptions = await Store.countDocuments({ 'plan.isActive': true });

    // Mock monthly revenue for now, or calculate based on active subscriptions if plans are populated.
    // Let's populate the plan to calculate revenue
    const storesWithPlans = await Store.find({ 'plan.isActive': true }).populate('plan.planId');
    const monthlyRevenue = storesWithPlans.reduce((acc, store) => {
      return acc + (store.plan?.planId?.price || 0);
    }, 0);

    res.json({
      totalStores,
      activeSubscriptions,
      monthlyRevenue
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle store status
// @route   PUT /api/superadmin/stores/:id/toggle
// @access  Private/Superadmin
export const toggleStoreStatus = async (req, res) => {
  try {
    const store = await Store.findById(req.params.id);
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    store.isActive = !store.isActive;
    const updatedStore = await store.save();

    res.json(updatedStore);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
