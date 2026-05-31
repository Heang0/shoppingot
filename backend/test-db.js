import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const uri = "mongodb://hakchhaiheang0:a3RBb6LsumMGXXPP@ac-8hon8qn-shard-00-00.pv4ugik.mongodb.net:27017,ac-8hon8qn-shard-00-01.pv4ugik.mongodb.net:27017,ac-8hon8qn-shard-00-02.pv4ugik.mongodb.net:27017/shoppingot?ssl=true&authSource=admin&replicaSet=atlas-fdjc0u-shard-0&retryWrites=true&w=majority";

console.log("Attempting to connect...");
mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })
  .then(() => {
    console.log("Successfully connected to MongoDB!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Connection failed!");
    console.error(err);
    process.exit(1);
  });
