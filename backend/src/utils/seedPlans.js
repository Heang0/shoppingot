import mongoose from 'mongoose';
import dotenv from 'dotenv';
import SubscriptionPlan from '../models/SubscriptionPlan.js';

dotenv.config();

const seedPlans = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);

    console.log('MongoDB Connected');

    // Define the preset plans
    const plans = [
      {
        name: 'Free',
        nameKm: 'ឥតគិតថ្លៃ',
        price: 0,
        durationDays: 30,
        maxProducts: 50,
        maxOrders: 50,
        hasAnalytics: false,
        hasCustomDomain: false,
        hasPrioritySupport: false,
      },
      {
        name: 'Pro',
        nameKm: 'ប្រូ',
        price: 9.99,
        durationDays: 30,
        maxProducts: 500,
        maxOrders: 1000,
        hasAnalytics: true,
        hasCustomDomain: false,
        hasPrioritySupport: false,
      },
      {
        name: 'Premium',
        nameKm: 'ព្រីមៀម',
        price: 29.99,
        durationDays: 30,
        maxProducts: 99999,
        maxOrders: 99999,
        hasAnalytics: true,
        hasCustomDomain: true,
        hasPrioritySupport: true,
      },
    ];

    // Upsert each plan
    for (const planData of plans) {
      await SubscriptionPlan.findOneAndUpdate(
        { name: planData.name },
        planData,
        { upsert: true, new: true }
      );
    }

    console.log('Plans seeded successfully!');
    process.exit();
  } catch (error) {
    console.error('Error seeding plans:', error);
    process.exit(1);
  }
};

seedPlans();
