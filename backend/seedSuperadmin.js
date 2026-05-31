import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './src/models/User.js'; // Adjust path if necessary

dotenv.config();

const seedSuperadmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    const email = 'superadmin@shoppingot.com';
    const password = 'password123';

    // Check if exists
    let superadmin = await User.findOne({ email });

    if (superadmin) {
      console.log('Superadmin already exists. Updating role...');
      superadmin.role = 'superadmin';
      await superadmin.save();
    } else {
      console.log('Creating new superadmin...');
      superadmin = new User({
        name: 'Super Administrator',
        email,
        password, // The model should hash this before saving if there's a pre-save hook
        role: 'superadmin'
      });
      await superadmin.save();
    }

    console.log('Superadmin created/updated successfully!');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedSuperadmin();
