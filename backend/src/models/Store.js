import mongoose from 'mongoose';

const storeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    category: {
      type: String,
      enum: ['Clothing', 'Food & Beverage', 'Electronics', 'General Retail', 'Other', 'Supplements (អាហារបំប៉ន់)'],
      default: 'General Retail',
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    plan: {
      planId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SubscriptionPlan',
      },
      expiresAt: {
        type: Date,
      },
      isActive: {
        type: Boolean,
        default: false,
      },
    },
    paymentSettings: {
      bakongId: {
        type: String,
      },
      bakongName: {
        type: String,
      },
      currency: {
        type: String,
        enum: ['USD', 'KHR'],
        default: 'USD',
      },
    },
    branding: {
      logoUrl: { type: String },
      bannerUrl: { type: String },
      primaryColor: { type: String, default: '#E84C3D' },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Store = mongoose.model('Store', storeSchema);

export default Store;
