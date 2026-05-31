import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Store from '../models/Store.js';

// @desc    Get store analytics summary
// @route   GET /api/analytics
// @access  Private (Store Admin)
export const getStoreAnalytics = async (req, res) => {
  try {
    const store = await Store.findOne({ ownerId: req.user._id });
    if (!store) {
      return res.status(404).json({ message: 'Store not found for this user' });
    }

    // 1. Calculate Total Revenue (Only PAID or DELIVERED orders)
    const paidOrders = await Order.find({ 
      storeId: store._id, 
      paymentStatus: 'PAID' 
    });
    
    const totalRevenue = paidOrders.reduce((sum, order) => sum + order.totalAmount, 0);

    // 2. Total Orders Count
    const totalOrders = await Order.countDocuments({ storeId: store._id });

    // 3. Total Products Count
    const totalProducts = await Product.countDocuments({ storeId: store._id });

    // 4. 5 Most Recent Orders
    const recentOrders = await Order.find({ storeId: store._id })
      .populate('customerId', 'name email')
      .populate('items.productId', 'title imageUrl')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalRevenue,
      totalOrders,
      totalProducts,
      recentOrders
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
