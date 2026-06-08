import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      sparse: true, // Allows nulls to not clash on unique constraint
    },
    password: {
      type: String,
    },
    telegramId: {
      type: String,
      unique: true,
      sparse: true,
    },
    role: {
      type: String,
      enum: ['superadmin', 'store_admin', 'customer'],
      default: 'customer',
    },
    profilePic: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      default: '',
    },
    address: {
      type: String,
      default: '',
    },
    addresses: [{
      recipientName: String,
      phoneNumber: String,
      addressString: String, // The combined "Street, Commune, District, Province"
      isDefault: {
        type: Boolean,
        default: false
      }
    }],
    favorites: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    }],
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
