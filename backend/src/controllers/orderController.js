import Order from '../models/Order.js';
import Store from '../models/Store.js';
import Product from '../models/Product.js';
import PromoCode from '../models/PromoCode.js';
import { generateKHQR, verifyKHQRTransaction } from '../services/bakongService.js';

// @desc    Create Order & Generate QR
// @route   POST /api/orders
// @access  Private (Customer)
const createOrderAndGenerateQR = async (req, res) => {
  try {
    const { storeId, items, totalAmount, guestInfo, deliveryPartner, deliveryFee, deliveryNote, subtotal, orderSource, paymentMethod, cashReceived, changeGiven, promoCode } = req.body;

    const store = await Store.findById(storeId);

    if (!store || !store.isActive) {
      return res.status(404).json({ message: 'Store not found or inactive' });
    }

    if (!store.paymentSettings || !store.paymentSettings.bakongId) {
      return res.status(400).json({ message: 'Store has not configured KHQR payments yet' });
    }
    
    const customerId = req.user ? req.user._id : null;
    const isGuest = !customerId;

    const isPOS = orderSource === 'POS';

    // Validate and Apply Promo Code
    let discountApplied = 0;
    let finalTotalAmount = totalAmount;
    let appliedPromoCode = undefined;

    if (promoCode) {
      const promo = await PromoCode.findOne({ storeId, code: promoCode.toUpperCase() });
      if (promo && promo.isActive && (!promo.validUntil || new Date() <= promo.validUntil) && (!promo.usageLimit || promo.usedCount < promo.usageLimit)) {
        if (subtotal >= promo.minPurchase) {
          if (promo.discountType === 'FIXED') {
            discountApplied = promo.discountValue;
          } else if (promo.discountType === 'PERCENTAGE') {
            discountApplied = (subtotal * promo.discountValue) / 100;
          }
          if (discountApplied > subtotal) discountApplied = subtotal;

          finalTotalAmount = subtotal - discountApplied + (deliveryFee || 0);
          appliedPromoCode = promo.code;

          // Increment usage count
          promo.usedCount += 1;
          await promo.save();
        }
      }
    }

    const order = new Order({
      storeId,
      customerId,
      isGuest,
      guestInfo,
      items,
      totalAmount: finalTotalAmount,
      subtotal: subtotal || totalAmount,
      deliveryPartner,
      deliveryFee: deliveryFee || 0,
      deliveryNote,
      promoCode: appliedPromoCode,
      discountApplied,
      orderSource: isPOS ? 'POS' : 'ONLINE',
      paymentMethod: paymentMethod || 'KHQR',
      paymentStatus: paymentMethod === 'CASH' ? 'PAID' : 'PENDING',
      cashReceived: cashReceived,
      changeGiven: changeGiven,
      cashierId: isPOS ? req.user._id : undefined,
    });
    await order.save();

    // Deduct stock if CASH (instantly paid)
    if (order.paymentStatus === 'PAID') {
      for (const item of items) {
        await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } });
      }
    }

    if (order.paymentMethod === 'CASH') {
      return res.status(201).json({
        orderId: order._id,
        totalAmount,
        currency: store.paymentSettings.currency,
        status: 'PAID'
      });
    }

    // Generate KHQR using Store's Bakong ID
    const { md5, qrString } = await generateKHQR(
      store.paymentSettings.bakongId,
      totalAmount,
      store.paymentSettings.currency,
      order._id.toString(),
      store.name
    );

    order.bakongMd5 = md5;
    order.qrString = qrString;
    await order.save();

    let deepLink = null;
    if (order.paymentMethod === 'bakong_app') {
      const { generateBakongDeepLink } = await import('../services/bakongService.js');
      deepLink = await generateBakongDeepLink(qrString);
    }

    res.status(201).json({
      orderId: order._id,
      qrString,
      md5,
      totalAmount: finalTotalAmount,
      currency: store.paymentSettings.currency,
      status: 'PENDING',
      deepLink
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
      order.orderStatus = 'PROCESSING';
      await order.save();

      // Deduct stock when paid
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } });
      }

      // [PHASE 3] Dispatch Telegram Notification to Merchant Group
      try {
        const store = await Store.findById(order.storeId);
        const telegramChatId = store?.telegramGroupId;
        
          let itemsList = '';
          order.items.forEach(item => {
            itemsList += `- ${item.quantity}x ${item.productId ? 'Product' : 'Item'}\n`;
          });
          
          const customerName = order.isGuest ? order.guestInfo?.name : order.customerId?.name || 'Unknown';
          const customerPhone = order.isGuest ? order.guestInfo?.phone : 'No Phone';
          const address = order.isGuest ? order.guestInfo?.address : 'No Address';

          const message = `🛍️ *New Order Paid! (ការបញ្ជាទិញថ្មីត្រូវបានទូទាត់!)*
          
*Order ID:* \`${order._id}\`
*Customer:* ${customerName}
*Phone:* ${customerPhone}
*Address:* ${address}
*Delivery:* ${order.deliveryPartner || 'Standard'}

*Items:*
${itemsList}
*Total:* *$${order.totalAmount.toFixed(2)}*`;
          // Import dynamically or we could import it at the top
          const { sendTelegramNotification } = await import('../services/telegramBot.js');
          await sendTelegramNotification(telegramChatId, message);
          
          console.log(`Telegram notification sent to merchant group (${telegramChatId})`);
        } else {
          console.log(`[MOCK TELEGRAM] 🛍️ New Order Paid! (No telegramGroupId linked or no token) for store ${store?.name}`);
        }
      } catch (err) {
        console.error('Failed to send Telegram notification', err);
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

    const filter = { storeId: store._id, paymentStatus: 'PAID' };

    const orders = await Order.find(filter)
      .populate('customerId', 'name email')
      .populate('items.productId', 'title imageUrl')
      .populate('storeId', 'name contact')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Order.countDocuments(filter);

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
    order.orderStatus = 'PROCESSING';
    await order.save();
    
    // Deduct stock when simulated
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } });
    }

    // [PHASE 3] Dispatch Telegram Notification to Merchant Group (for DEV Simulation)
    try {
      const store = await Store.findById(order.storeId);
      const telegramChatId = store?.telegramGroupId;
      
      if (telegramChatId && process.env.TELEGRAM_BOT_TOKEN) {
        let itemsList = '';
        order.items.forEach(item => {
          itemsList += `- ${item.quantity}x ${item.productId ? 'Product' : 'Item'}\n`;
        });
        
        const customerName = order.isGuest ? order.guestInfo?.name : order.customerId?.name || 'Unknown';
        const customerPhone = order.isGuest ? order.guestInfo?.phone : 'No Phone';
        const address = order.isGuest ? order.guestInfo?.address : 'No Address';

        const message = `🛍️ *[TEST] New Order Paid! (ការបញ្ជាទិញថ្មីត្រូវបានទូទាត់!)*
        
*Order ID:* \`${order._id}\`
*Customer:* ${customerName}
*Phone:* ${customerPhone}
*Address:* ${address}
*Delivery:* ${order.deliveryPartner || 'Standard'}

*Items:*
${itemsList}
*Total:* *$${order.totalAmount.toFixed(2)}*`;
        const { sendTelegramNotification } = await import('../services/telegramBot.js');
        await sendTelegramNotification(telegramChatId, message);
      }
    } catch (err) {
      console.error('Failed to send Telegram notification', err);
    }
    
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
