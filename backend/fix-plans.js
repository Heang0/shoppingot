import mongoose from 'mongoose';
import Store from './src/models/Store.js';
import SubscriptionPlan from './src/models/SubscriptionPlan.js';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI).then(async () => {
  const freePlan = await SubscriptionPlan.findOne({ price: 0 });
  if (!freePlan) {
    console.log('No free plan found in DB');
    process.exit(1);
  }
  
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + freePlan.durationDays);
  
  const result = await Store.updateMany(
    { 'plan.planId': { $exists: false } },
    { 
      $set: { 
        plan: {
          planId: freePlan._id,
          expiresAt: expiryDate,
          isActive: true
        }
      } 
    }
  );
  
  console.log('Updated existing stores:', result.modifiedCount);
  process.exit(0);
});
