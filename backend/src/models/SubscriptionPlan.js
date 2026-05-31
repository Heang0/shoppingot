import mongoose from 'mongoose';

const subscriptionPlanSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    nameKm: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    durationDays: {
      type: Number,
      required: true,
    },
    maxProducts: {
      type: Number,
      required: true,
    },
    maxOrders: {
      type: Number,
      required: true,
    },
    hasAnalytics: {
      type: Boolean,
      default: false,
    },
    hasCustomDomain: {
      type: Boolean,
      default: false,
    },
    hasPrioritySupport: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const SubscriptionPlan = mongoose.model('SubscriptionPlan', subscriptionPlanSchema);

export default SubscriptionPlan;
