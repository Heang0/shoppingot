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
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

export { updateUserProfile };
