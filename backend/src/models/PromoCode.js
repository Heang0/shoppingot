import mongoose from 'mongoose';

const promoCodeSchema = new mongoose.Schema({
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Store',
  },
  code: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
  },
  discountType: {
    type: String,
    enum: ['PERCENTAGE', 'FIXED'],
    required: true,
    default: 'PERCENTAGE',
  },
  discountValue: {
    type: Number,
    required: true,
  },
  minPurchase: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  usageLimit: {
    type: Number,
    default: null, // null means unlimited
  },
  usedCount: {
    type: Number,
    default: 0,
  },
  validUntil: {
    type: Date,
    default: null,
  }
}, { timestamps: true });

// Ensure promo codes are unique per store
promoCodeSchema.index({ storeId: 1, code: 1 }, { unique: true });

const PromoCode = mongoose.model('PromoCode', promoCodeSchema);

export default PromoCode;
