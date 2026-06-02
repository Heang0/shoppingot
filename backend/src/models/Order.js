import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    isGuest: {
      type: Boolean,
      default: false,
    },
    guestInfo: {
      name: { type: String },
      phone: { type: String },
      address: { type: String },
    },
    deliveryPartner: {
      type: String,
      enum: ['J&T Express', 'VET Express', 'Grab', 'Jalat Logistics', 'Chat 1', 'Other'],
      default: 'J&T Express',
    },
    deliveryFee: {
      type: Number,
      default: 0,
    },
    deliveryNote: {
      type: String,
    },
    subtotal: {
      type: Number,
      default: 0,
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        selectedVariants: {
          type: Map,
          of: String, // e.g. { "Size": "M", "Color": "Red" }
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    bakongMd5: {
      type: String,
    },
    orderSource: {
      type: String,
      enum: ['ONLINE', 'POS'],
      default: 'ONLINE',
    },
    paymentMethod: {
      type: String,
      enum: ['KHQR', 'CASH'],
      default: 'KHQR',
    },
    cashReceived: {
      type: Number,
    },
    changeGiven: {
      type: Number,
    },
    cashierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PAID', 'FAILED'],
      default: 'PENDING',
    },
    orderStatus: {
      type: String,
      enum: ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'],
      default: 'PENDING',
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model('Order', orderSchema);

// Create indexes
orderSchema.index({ storeId: 1, paymentStatus: 1, createdAt: -1 });
orderSchema.index({ customerId: 1 });

export default Order;
