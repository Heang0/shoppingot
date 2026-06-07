import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Default transformation for products (600px is the sweet spot for crisp e-commerce photos without wasting bandwidth)
    let transformation = [{ width: 600, crop: 'limit' }, { quality: 'auto:good', fetch_format: 'webp' }];
    
    // Check type from query params
    if (req.query.type === 'profile' || req.query.type === 'storeLogo') {
      // Logos and Avatars are kept extremely small (200px) and highly compressed to save maximum bandwidth
      transformation = [{ width: 200, crop: 'limit' }, { quality: 'auto:eco', fetch_format: 'webp' }];
    } else if (req.query.type === 'banner') {
      // Banners are wide but highly compressed
      transformation = [{ width: 800, crop: 'limit' }, { quality: 'auto:eco', fetch_format: 'webp' }];
    }

    return {
      folder: 'shoppingot',
      allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
      transformation: transformation,
    };
  },
});

const upload = multer({ storage: storage });

// @desc    Upload image to Cloudinary
// @route   POST /api/upload
// @access  Public
router.post('/', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    res.json({
      url: req.file.path,
      message: 'Image uploaded successfully',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
