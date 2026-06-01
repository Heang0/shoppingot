import Order from '../models/Order.js';
import Store from '../models/Store.js';
import { generateKHQR, verifyKHQRTransaction } from '../services/bakongService.js';

// @desc    Create Order & Generate QR
// @route   POST /api/orders
// @access  Private (Customer)
const createOrderAndGenerateQR = async (req, res) => {
  const { storeId, items, totalAmount, guestInfo } = req.body;

  try {
    const store = await Store.findById(storeId);

    if (!store || !store.isActive) {
      return res.status(404).json({ message: 'Store not found or inactive' });
    }

    if (!store.paymentSettings || !store.paymentSettings.bakongId) {
      return res.status(400).json({ message: 'Store has not configured KHQR payments yet' });
    }
    
    const customerId = req.user ? req.user._id : null;
    const isGuest = !customerId;

    const order = new Order({
      storeId,
      customerId,
      isGuest,
      guestInfo: isGuest ? guestInfo : undefined,
      items,
      totalAmount,
      paymentStatus: 'PENDING',
    });
    await order.save();

    // Generate KHQR using Store's Bakong ID
    const { md5, qrString } = await generateKHQR(
      store.paymentSettings.bakongId,
      totalAmount,
      store.paymentSettings.currency,
      order._id.toString()
    );

    order.bakongMd5 = md5;
    await order.save();

    res.status(201).json({
      orderId: order._id,
      qrString,
      md5,
      totalAmount,
      currency: store.paymentSettings.currency,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify Order Payment KHQR
// @route   POST /api/orders/:id/verify
// @access  Public / Private (Customer)
const verifyOrderPayment = async (req, res) => {
  const { md5 } = req.body;
  const orderId = req.params.id;

  try {
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.paymentStatus === 'PAID') {
      return res.json({ status: 'PAID' });
    }

    const verificationResult = await verifyKHQRTransaction(md5);

    if (verificationResult.status === 0) {
      order.paymentStatus = 'PAID';
      await order.save();

      // [PHASE 3] Dispatch Telegram Notification to Merchant
      // If TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID are in .env, send a real message
      if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
        try {
          const message = `🛍️ New Order Paid!\nOrder ID: ${order._id}\nTotal: $${order.totalAmount.toFixed(2)}`;
          await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: process.env.TELEGRAM_CHAT_ID,
              text: message,
            }),
          });
          console.log('Telegram notification sent to merchant');
        } catch (err) {
          console.error('Failed to send Telegram notification', err);
        }
      } else {
        console.log('[MOCK TELEGRAM] 🛍️ New Order Paid!', order._id);
      }
      return res.json({ status: 'PAID' });
    }

    res.json({ status: 'PENDING' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get orders for a store (Admin View)
// @route   GET /api/orders/store
// @access  Private (Store Admin)
const getOrdersForStore = async (req, res) => {
  try {
    const store = await Store.findOne({ ownerId: req.user._id });
    if (!store) {
      return res.status(404).json({ message: 'Store not found for this user' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const orders = await Order.find({ storeId: store._id })
      .populate('customerId', 'name email')
      .populate('items.productId', 'title imageUrl')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Order.countDocuments({ storeId: store._id });

    res.json({
      orders,
      page,
      totalPages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get orders for a customer (Customer View)
// @route   GET /api/orders/customer
// @access  Private
const getCustomerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customerId: req.user._id })
      .populate('storeId', 'name slug')
      .populate('items.productId', 'title imageUrl price')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (Store Admin)
const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const store = await Store.findOne({ ownerId: req.user._id });
    if (!store || order.storeId.toString() !== store._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to update this order' });
    }

    order.orderStatus = orderStatus;
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Simulate Webhook Payment (DEV ONLY)
// @route   POST /api/orders/:id/simulate-pay
// @access  Public
const simulateOrderPayment = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    
    order.paymentStatus = 'PAID';
    await order.save();
    
    res.json({ message: 'Simulated payment success' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get store analytics
// @route   GET /api/orders/analytics
// @access  Private (Store Admin)
const getStoreAnalytics = async (req, res) => {
  try {
    const store = await Store.findOne({ ownerId: req.user._id });
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    const totalOrders = await Order.countDocuments({ storeId: store._id, paymentStatus: 'PAID' });
    
    const revenueResult = await Order.aggregate([
      { $match: { storeId: store._id, paymentStatus: 'PAID' } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    // Past 7 days revenue
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
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Fill in missing days
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayData = dailyRevenue.find(dr => dr._id === dateStr);
      last7Days.push({
        date: dateStr,
        shortDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: dayData ? dayData.revenue : 0,
        orders: dayData ? dayData.orders : 0
      });
    }

    res.json({
      totalOrders,
      totalRevenue,
      chartData: last7Days
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { createOrderAndGenerateQR, verifyOrderPayment, getOrdersForStore, getCustomerOrders, updateOrderStatus, simulateOrderPayment, getStoreAnalytics };
