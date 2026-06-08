import User from '../models/User.js';

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    if (req.body.password) {
      user.password = req.body.password;
    }
    if (req.body.profilePic !== undefined) {
      user.profilePic = req.body.profilePic;
    }
    if (req.body.phone !== undefined) {
      user.phone = req.body.phone;
    }
    if (req.body.address !== undefined) {
      user.address = req.body.address;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      profilePic: updatedUser.profilePic,
      phone: updatedUser.phone,
      address: updatedUser.address,
      addresses: updatedUser.addresses,
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

const addAddress = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    const { recipientName, phoneNumber, addressString } = req.body;
    const isDefault = user.addresses.length === 0 ? true : req.body.isDefault || false;

    if (isDefault) {
      user.addresses.forEach(a => a.isDefault = false);
    }

    user.addresses.push({ recipientName, phoneNumber, addressString, isDefault });
    await user.save();
    res.status(201).json(user.addresses);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

const updateAddress = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    const { recipientName, phoneNumber, addressString, isDefault } = req.body;
    const address = user.addresses.id(req.params.id);

    if (address) {
      address.recipientName = recipientName || address.recipientName;
      address.phoneNumber = phoneNumber || address.phoneNumber;
      address.addressString = addressString || address.addressString;

      if (isDefault) {
        user.addresses.forEach(a => a.isDefault = false);
        address.isDefault = true;
      }

      await user.save();
      res.json(user.addresses);
    } else {
      res.status(404).json({ message: 'Address not found' });
    }
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

const deleteAddress = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    const address = user.addresses.id(req.params.id);
    if (address) {
      // Use standard mongoose subdocument removal if possible, or pull
      user.addresses.pull(req.params.id);
      
      // If we deleted the default, set another one to default
      if (address.isDefault && user.addresses.length > 0) {
        user.addresses[0].isDefault = true;
      }
      
      await user.save();
      res.json(user.addresses);
    } else {
      res.status(404).json({ message: 'Address not found' });
    }
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

const setDefaultAddress = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    const address = user.addresses.id(req.params.id);
    if (address) {
      user.addresses.forEach(a => a.isDefault = false);
      address.isDefault = true;
      await user.save();
      res.json(user.addresses);
    } else {
      res.status(404).json({ message: 'Address not found' });
    }
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

const toggleFavorite = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    const { productId } = req.params;
    if (!user.favorites) user.favorites = [];
    
    const index = user.favorites.indexOf(productId);
    if (index === -1) {
      user.favorites.push(productId);
    } else {
      user.favorites.splice(index, 1);
    }
    
    await user.save();
    
    const updatedUser = await User.findById(user._id).populate({
      path: 'favorites',
      select: 'title imageUrl price storeId slug',
      populate: { path: 'storeId', select: 'slug name branding' }
    });
    
    res.json(updatedUser.favorites);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

const getFavorites = async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: 'favorites',
    select: 'title imageUrl price storeId slug isBestSeller stock',
    populate: { path: 'storeId', select: 'slug name branding' }
  });
  if (user) {
    res.json(user.favorites || []);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

export { updateUserProfile, addAddress, updateAddress, deleteAddress, setDefaultAddress, toggleFavorite, getFavorites };
