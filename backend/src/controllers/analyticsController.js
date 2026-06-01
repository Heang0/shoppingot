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

    // 5. Past 7 days revenue for Recharts
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const dailyRevenue = await Order.aggregate([
      { 
        $match: { 
          storeId: store._id, 
          paymentStatus: 'PAID',
          createdAt: { $gte: sevenDaysAgo }
        } 
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' }
        }
      }
    ]);

    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayData = dailyRevenue.find(dr => dr._id === dateStr);
      chartData.push({
        date: dateStr,
        shortDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: dayData ? dayData.revenue : 0,
      });
    }

    res.json({
      totalRevenue,
      totalOrders,
      totalProducts,
      recentOrders,
      chartData
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
