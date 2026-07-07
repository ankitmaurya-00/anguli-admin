const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Village = require('../models/Village');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '30d' });
};

const sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  bio: user.bio,
  profilePicture: user.profilePicture,
  coverPhoto: user.coverPhoto,
  socialLinks: user.socialLinks,
  village: user.village,
  district: user.district,
  state: user.state,
  followersCount: user.followersCount,
  followingCount: user.followingCount,
  postsCount: user.postsCount,
  isVerified: user.isVerified,
  createdAt: user.createdAt,
});

// @desc   Register new user
// @route  POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, village, district, state } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    if (village) {
      const villageDoc = await Village.findById(village);
      if (!villageDoc) {
        return res.status(400).json({ success: false, message: 'Invalid village selected' });
      }
    }

    const user = await User.create({ name, email, password, village, district, state });

    const token = generateToken(user._id);
    res.status(201).json({ success: true, token, user: sanitizeUser(user) });
  } catch (error) {
    next(error);
  }
};

// @desc   Login user
// @route  POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (user.isBanned) {
      return res.status(403).json({ success: false, message: 'Your account has been banned', reason: user.banReason });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);
    res.json({ success: true, token, user: sanitizeUser(user) });
  } catch (error) {
    next(error);
  }
};

// @desc   Get logged-in user's profile
// @route  GET /api/auth/me
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('village', 'name slug')
      .populate('district', 'name')
      .populate('state', 'name');
    res.json({ success: true, user: sanitizeUser(user) });
  } catch (error) {
    next(error);
  }
};

// @desc   Change password
// @route  PUT /api/auth/change-password
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Valid current and new password (min 6 chars) required' });
    }

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
};

exports.sanitizeUser = sanitizeUser;
