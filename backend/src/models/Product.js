import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
    },
    title: {
      type: String,
      required: true,
    },
    titleKm: {
      type: String,
    },
    slug: {
      type: String,
      unique: true,
      sparse: true,
    },
    description: {
      type: String,
    },
    descriptionKm: {
      type: String,
    },
    price: {
      type: Number,
      required: true,
    },
    imageUrl: {
      type: String,
    },
    stock: {
      type: Number,
      default: 0,
    },
    barcode: {
      type: String,
      sparse: true,
    },
    sku: {
      type: String,
    },
    variants: [
      {
        name: { type: String, required: true }, // e.g. "Size"
        options: [{ type: String }] // e.g. ["S", "M", "L"]
      }
    ],
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model('Product', productSchema);

// Create indexes
productSchema.index({ storeId: 1, createdAt: -1 });
productSchema.index({ storeId: 1, category: 1 });

export default Product;
