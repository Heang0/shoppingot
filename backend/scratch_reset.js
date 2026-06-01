import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const resetStores = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
    const db = mongoose.connection;
    const plan = await db.collection('subscriptionplans').findOne({ name: 'Free' });
    if(plan) {
      await db.collection('stores').updateMany({}, { $set: { 'plan.planId': plan._id } });
      console.log('All stores reset to Free plan');
    } else {
      console.log('Free plan not found');
    }
  } catch(e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
};
resetStores();
