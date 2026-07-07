const User = require('../models/User');
const Post = require('../models/Post');
const Follow = require('../models/Follow');
const { sanitizeUser } = require('./authController');

// @desc   Get public profile by ID
// @route  GET /api/users/:id
exports.getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('village', 'name slug')
      .populate('district', 'name')
      .populate('state', 'name');

    if (!user || user.isBanned) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let isFollowing = false;
    if (req.user) {
      isFollowing = !!(await Follow.findOne({ follower: req.user._id, following: user._id }));
    }

    res.json({ success: true, user: { ...sanitizeUser(user), isFollowing } });
  } catch (error) {
    next(error);
  }
};

// @desc   Update own profile (bio, profile pic, social links)
// @route  PUT /api/users/me
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, bio, socialLinks, village, district, state } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (bio !== undefined) updates.bio = bio;
    if (socialLinks) updates.socialLinks = socialLinks;
    if (village) updates.village = village;
    if (district) updates.district = district;
    if (state) updates.state = state;

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.json({ success: true, user: sanitizeUser(user) });
  } catch (error) {
    next(error);
  }
};

// @desc   Upload/update profile picture
// @route  PUT /api/users/me/profile-picture
exports.updateProfilePicture = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image uploaded' });
    }
    const user = await User.findByIdAndUpdate(req.user._id, { profilePicture: req.file.path }, { new: true });
    res.json({ success: true, profilePicture: user.profilePicture });
  } catch (error) {
    next(error);
  }
};

// @desc   Upload/update cover photo
// @route  PUT /api/users/me/cover-photo
exports.updateCoverPhoto = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image uploaded' });
    }
    const user = await User.findByIdAndUpdate(req.user._id, { coverPhoto: req.file.path }, { new: true });
    res.json({ success: true, coverPhoto: user.coverPhoto });
  } catch (error) {
    next(error);
  }
};

// @desc   Get a user's posts (for their profile page)
// @route  GET /api/users/:id/posts
exports.getUserPosts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { author: req.params.id, isHidden: false };
    const [posts, total] = await Promise.all([
      Post.find(filter)
        .populate('author', 'name profilePicture village')
        .sort('-isPinned -createdAt')
        .skip(skip)
        .limit(limit),
      Post.countDocuments(filter),
    ]);
    res.json({ success: true, count: posts.length, total, page, pages: Math.ceil(total / limit), posts });
  } catch (error) {
    next(error);
  }
};

// @desc   Activity feed - user's own activity log (posts, likes, comments made)
// @route  GET /api/users/me/activity
exports.getMyActivity = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const posts = await Post.find({ author: req.user._id })
      .select('content postType createdAt likesCount commentsCount')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);

    const activity = posts.map((p) => ({
      type: 'post',
      id: p._id,
      summary: p.content ? p.content.slice(0, 100) : `${p.postType} post`,
      likesCount: p.likesCount,
      commentsCount: p.commentsCount,
      createdAt: p.createdAt,
    }));

    res.json({ success: true, count: activity.length, activity });
  } catch (error) {
    next(error);
  }
};
