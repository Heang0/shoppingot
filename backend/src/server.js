import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';
import rateLimit from 'express-rate-limit';
import connectDB from './config/db.js';

dotenv.config();

// Connect to database
connectDB();

import authRoutes from './routes/authRoutes.js';
import planRoutes from './routes/planRoutes.js';
import storeRoutes from './routes/storeRoutes.js';
import subscriptionRoutes from './routes/subscriptionRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import productRoutes from './routes/productRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import superadminRoutes from './routes/superadminRoutes.js';
import userRoutes from './routes/userRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';

import path from 'path';

const app = express();

// Middleware
// Set Security HTTP Headers
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));

// Configure CORS
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    // Allow localhost and any subdomains on localhost:3000
    if (origin.match(/^http:\/\/(?:[a-zA-Z0-9-]+\.)?localhost:3000$/)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'), false);
  },
  credentials: true,
}));

// Global Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 500, // Limit each IP to 500 requests per window
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);

// Body parser with size limit
app.use(express.json({ limit: '10kb' }));

// Data Sanitization against NoSQL query injection
// Disabled due to Express 5 req.query getter compatibility issue. Mongoose schema casting provides baseline protection.
// app.use(mongoSanitize());

// Data Sanitization against XSS
// Disabled due to Express 5 compatibility issues
// app.use(xss());

// Prevent HTTP Parameter Pollution
// Disabled due to Express 5 compatibility issues
// app.use(hpp());

// Serve static uploads folder
const __dirname = path.resolve();
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/superadmin/plans', planRoutes);
app.use('/api/superadmin', superadminRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/upload', uploadRoutes);

app.get('/', (req, res) => {
  res.send('ShoppingOT API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
