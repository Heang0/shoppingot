import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Product from './src/models/Product.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const uri = "mongodb://hakchhaiheang0:a3RBb6LsumMGXXPP@ac-8hon8qn-shard-00-00.pv4ugik.mongodb.net:27017,ac-8hon8qn-shard-00-01.pv4ugik.mongodb.net:27017,ac-8hon8qn-shard-00-02.pv4ugik.mongodb.net:27017/shoppingot?ssl=true&authSource=admin&replicaSet=atlas-fdjc0u-shard-0&retryWrites=true&w=majority";

const run = async () => {
  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    const products = await Product.find({});
    let count = 0;
    
    for (const p of products) {
      // Add a couple of realistic sub images if empty
      if (!p.images || p.images.length === 0) {
        if (p.title.includes('Bag') || p.title.includes('Backpack') || p.title.includes('Accessories')) {
          p.images = [
            "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&q=80",
            "https://images.unsplash.com/photo-1627123424574-724758594e93?w=500&q=80"
          ];
        } else if (p.title.includes('Glasses') || p.title.includes('Sunglasses')) {
          p.images = [
            "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500&q=80",
            "https://images.unsplash.com/photo-1577803645773-f96470509666?w=500&q=80"
          ];
        } else {
           // Default to some neutral fashion details
           p.images = [
             "https://images.unsplash.com/photo-1445205170230-053b83016050?w=500&q=80",
             "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=500&q=80",
             "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&q=80"
           ];
        }
        await p.save();
        count++;
      }
    }
    
    console.log(`Successfully updated ${count} products with sub images!`);
    process.exit(0);
  } catch (error) {
    console.error('Error updating products:', error);
    process.exit(1);
  }
};

run();
