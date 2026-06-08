import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import crypto from 'crypto';

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const authUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePic: user.profilePic,
        phone: user.phone,
        address: user.address,
        addresses: user.addresses,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public (Store Admin registration) / Private (Superadmin creates others)
const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Default to store_admin for public registration, superadmin needs manual DB entry or auth
    const userRole = role === 'superadmin' ? 'customer' : (role || 'store_admin');

    const user = await User.create({
      name,
      email,
      password,
      role: userRole,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePic: user.profilePic,
        phone: user.phone,
        address: user.address,
        addresses: user.addresses,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate with Telegram
// @route   POST /api/auth/telegram
// @access  Public
const telegramLogin = async (req, res) => {
  const data = req.body;
  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  if (!botToken) {
    return res.status(500).json({ message: 'Server not configured for Telegram Login' });
  }

  // 1. Verify Hash
  const { hash, ...userData } = data;
  const dataCheckArr = [];
  for (const key in userData) {
    if (userData[key] !== undefined && userData[key] !== null) {
      dataCheckArr.push(`${key}=${userData[key]}`);
    }
  }
  dataCheckArr.sort();
  const dataCheckString = dataCheckArr.join('\n');

  const secretKey = crypto.createHash('sha256').update(botToken).digest();
  const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

  if (calculatedHash !== hash) {
    return res.status(401).json({ message: 'Invalid Telegram authentication' });
  }

  // 2. Check if auth_date is too old (e.g., older than 24 hours)
  const now = Math.floor(Date.now() / 1000);
  if (now - data.auth_date > 86400) {
    return res.status(401).json({ message: 'Authentication data expired' });
  }

  try {
    // 3. Find or Create User
    let user = await User.findOne({ telegramId: data.id.toString() });

    if (!user) {
      // Create new customer account automatically
      user = await User.create({
        name: data.first_name + (data.last_name ? ` ${data.last_name}` : ''),
        telegramId: data.id.toString(),
        profilePic: data.photo_url || '',
        role: 'customer',
      });
    }

    // 4. Return token
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email, // might be undefined
      role: user.role,
      profilePic: user.profilePic,
      phone: user.phone,
      address: user.address,
      addresses: user.addresses,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @desc    Link Telegram to existing user account
// @route   PUT /api/auth/telegram/link
// @access  Private
const linkTelegramAccount = async (req, res) => {
  const data = req.body;
  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  if (!botToken) {
    return res.status(500).json({ message: 'Server not configured for Telegram Login' });
  }

  // 1. Verify Hash
  const { hash, ...userData } = data;
  const dataCheckArr = [];
  for (const key in userData) {
    if (userData[key] !== undefined && userData[key] !== null) {
      dataCheckArr.push(`${key}=${userData[key]}`);
    }
  }
  dataCheckArr.sort();
  const dataCheckString = dataCheckArr.join('\n');

  const secretKey = crypto.createHash('sha256').update(botToken).digest();
  const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

  if (calculatedHash !== hash) {
    return res.status(401).json({ message: 'Invalid Telegram authentication' });
  }

  // 2. Check if auth_date is too old (e.g., older than 24 hours)
  const now = Math.floor(Date.now() / 1000);
  if (now - data.auth_date > 86400) {
    return res.status(401).json({ message: 'Authentication data expired' });
  }

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if telegramId is already linked to another account
    const existingLink = await User.findOne({ telegramId: data.id.toString(), _id: { $ne: req.user._id } });
    if (existingLink) {
      return res.status(400).json({ message: 'This Telegram account is already linked to another user' });
    }

    user.telegramId = data.id.toString();
    await user.save();

    res.json({ message: 'Telegram account linked successfully', telegramId: user.telegramId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { authUser, registerUser, telegramLogin, linkTelegramAccount };
