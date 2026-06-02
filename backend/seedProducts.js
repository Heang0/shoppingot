import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Store from './src/models/Store.js';
import Category from './src/models/Category.js';
import Product from './src/models/Product.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

// Force cloud URI since local is failing
const uri = "mongodb://hakchhaiheang0:a3RBb6LsumMGXXPP@ac-8hon8qn-shard-00-00.pv4ugik.mongodb.net:27017,ac-8hon8qn-shard-00-01.pv4ugik.mongodb.net:27017,ac-8hon8qn-shard-00-02.pv4ugik.mongodb.net:27017/shoppingot?ssl=true&authSource=admin&replicaSet=atlas-fdjc0u-shard-0&retryWrites=true&w=majority";

const seedData = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log('Connected to MongoDB');

    // Find the store
    let store = await Store.findOne({ slug: 'steavnews' });
    if (!store) {
      console.log('Store steavnews not found, falling back to first available store...');
      store = await Store.findOne();
    }

    if (!store) {
      console.error('No stores found in the database. Please create a store first.');
      process.exit(1);
    }
    
    console.log(`Seeding data for store: ${store.name} (${store.slug})`);

    // Create Categories
    const categoriesData = [
      { storeId: store._id, name: 'Clothing', nameKm: 'សម្លៀកបំពាក់', slug: 'clothing-' + Date.now() },
      { storeId: store._id, name: 'Electronics', nameKm: 'គ្រឿងអេឡិចត្រូនិក', slug: 'electronics-' + Date.now() },
      { storeId: store._id, name: 'Accessories', nameKm: 'គ្រឿងបន្លាស់', slug: 'accessories-' + Date.now() },
    ];

    const createdCategories = [];
    for (const catData of categoriesData) {
      let cat = await Category.findOne({ storeId: store._id, name: catData.name });
      if (!cat) {
        cat = await Category.create(catData);
      }
      createdCategories.push(cat);
    }

    const [clothingCat, electronicsCat, accessoriesCat] = createdCategories;

    // Create 10 Products
    const productsData = [
      {
        storeId: store._id,
        category: clothingCat._id,
        title: "Classic Cotton T-Shirt",
        titleKm: "អាវយឺតកប្បាស",
        description: "Premium quality cotton t-shirt for everyday wear.",
        descriptionKm: "អាវយឺតកប្បាសគុណភាពខ្ពស់សម្រាប់ស្លៀកពាក់ប្រចាំថ្ងៃ។",
        price: 15.99,
        imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&q=80",
        stock: 100,
        slug: "classic-cotton-tshirt-" + Date.now(),
        variants: [
          { name: "Size", options: ["S", "M", "L", "XL"] },
          { name: "Color", options: ["White", "Black", "Navy"] }
        ]
      },
      {
        storeId: store._id,
        category: clothingCat._id,
        title: "Denim Jeans Relaxed Fit",
        titleKm: "ខោខូវប៊យ",
        description: "Comfortable and durable denim jeans.",
        descriptionKm: "ខោខូវប៊យដែលមានផាសុកភាពនិងធន់។",
        price: 49.99,
        imageUrl: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&q=80",
        stock: 50,
        slug: "denim-jeans-" + Date.now(),
        variants: [
          { name: "Waist", options: ["28", "30", "32", "34", "36"] }
        ]
      },
      {
        storeId: store._id,
        category: clothingCat._id,
        title: "Winter Puffer Jacket",
        titleKm: "អាវរងា",
        description: "Keep warm during the cold season.",
        descriptionKm: "រក្សាភាពកក់ក្តៅក្នុងរដូវរងា។",
        price: 89.99,
        imageUrl: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&q=80",
        stock: 20,
        slug: "winter-puffer-" + Date.now(),
        variants: [
          { name: "Size", options: ["M", "L", "XL"] }
        ]
      },
      {
        storeId: store._id,
        category: electronicsCat._id,
        title: "Wireless Noise-Canceling Headphones",
        titleKm: "កាសឥតខ្សែ",
        description: "Immersive sound with active noise cancellation.",
        descriptionKm: "សំឡេងច្បាស់ជាមួយមុខងារកាត់បន្ថយសំឡេងរំខាន។",
        price: 199.99,
        imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80",
        stock: 30,
        slug: "wireless-headphones-" + Date.now(),
        variants: [
          { name: "Color", options: ["Black", "Silver", "Rose Gold"] }
        ]
      },
      {
        storeId: store._id,
        category: electronicsCat._id,
        title: "Smart Watch Series 8",
        titleKm: "នាឡិកាឆ្លាតវៃ",
        description: "Track your fitness and stay connected.",
        descriptionKm: "តាមដានសុខភាពនិងទំនាក់ទំនងរបស់អ្នក។",
        price: 299.99,
        imageUrl: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&q=80",
        stock: 15,
        slug: "smart-watch-" + Date.now(),
        variants: []
      },
      {
        storeId: store._id,
        category: electronicsCat._id,
        title: "Ultra-Thin Laptop 14\"",
        titleKm: "កុំព្យូទ័រយួរដៃស្តើង",
        description: "Powerful performance in a sleek design.",
        descriptionKm: "ដំណើរការខ្លាំងក្នុងការរចនាដ៏ស្រស់ស្អាត។",
        price: 899.99,
        imageUrl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&q=80",
        stock: 10,
        slug: "ultra-thin-laptop-" + Date.now(),
        variants: [
          { name: "Storage", options: ["256GB", "512GB", "1TB"] },
          { name: "RAM", options: ["8GB", "16GB"] }
        ]
      },
      {
        storeId: store._id,
        category: accessoriesCat._id,
        title: "Polarized Sunglasses",
        titleKm: "វ៉ែនតាការពារពន្លឺ",
        description: "Protect your eyes with style.",
        descriptionKm: "ការពារភ្នែករបស់អ្នកជាមួយនឹងស្តាយ។",
        price: 24.99,
        imageUrl: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500&q=80",
        stock: 80,
        slug: "polarized-sunglasses-" + Date.now(),
        variants: []
      },
      {
        storeId: store._id,
        category: accessoriesCat._id,
        title: "Leather Wallet",
        titleKm: "កាបូបលុយស្បែក",
        description: "Genuine leather minimalist wallet.",
        descriptionKm: "កាបូបលុយស្បែកសុទ្ធ។",
        price: 34.99,
        imageUrl: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=500&q=80",
        stock: 45,
        slug: "leather-wallet-" + Date.now(),
        variants: [
          { name: "Color", options: ["Brown", "Black"] }
        ]
      },
      {
        storeId: store._id,
        category: accessoriesCat._id,
        title: "Canvas Backpack",
        titleKm: "កាបូបស្ពាយ",
        description: "Durable backpack for everyday use or travel.",
        descriptionKm: "កាបូបស្ពាយធន់សម្រាប់ការប្រើប្រាស់ប្រចាំថ្ងៃ។",
        price: 59.99,
        imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&q=80",
        stock: 25,
        slug: "canvas-backpack-" + Date.now(),
        variants: []
      },
      {
        storeId: store._id,
        category: clothingCat._id,
        title: "Running Sneakers",
        titleKm: "ស្បែកជើងរត់",
        description: "Lightweight and breathable running shoes.",
        descriptionKm: "ស្បែកជើងរត់ស្រាលនិងត្រជាក់។",
        price: 129.99,
        imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80",
        stock: 40,
        slug: "running-sneakers-" + Date.now(),
        variants: [
          { name: "Size (US)", options: ["8", "9", "10", "11", "12"] }
        ]
      }
    ];

    console.log('Inserting 10 products...');
    for (const prod of productsData) {
      await Product.create(prod);
      // small delay to ensure unique slugs since we use Date.now()
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    console.log('Successfully seeded 10 products!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
