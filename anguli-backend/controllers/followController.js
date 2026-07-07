const Follow = require('../models/Follow');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc   Follow a user
// @route  POST /api/users/:id/follow
exports.followUser = async (req, res, next) => {
  try {
    const targetId = req.params.id;
    if (targetId === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot follow yourself' });
    }

    const targetUser = await User.findById(targetId);
    if (!targetUser) return res.status(404).json({ success: false, message: 'User not found' });

    const existing = await Follow.findOne({ follower: req.user._id, following: targetId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Already following this user' });
    }

    await Follow.create({ follower: req.user._id, following: targetId });
    await User.findByIdAndUpdate(req.user._id, { $inc: { followingCount: 1 } });
    await User.findByIdAndUpdate(targetId, { $inc: { followersCount: 1 } });

    await Notification.create({
      recipient: targetId,
      sender: req.user._id,
      type: 'follow',
      message: `${req.user.name} started following you`,
      targetType: 'User',
      targetId: req.user._id,
    });

    res.status(201).json({ success: true, message: 'Followed successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc   Unfollow a user
// @route  DELETE /api/users/:id/follow
exports.unfollowUser = async (req, res, next) => {
  try {
    const targetId = req.params.id;
    const existing = await Follow.findOneAndDelete({ follower: req.user._id, following: targetId });
    if (!existing) {
      return res.status(400).json({ success: false, message: 'You are not following this user' });
    }

    await User.findByIdAndUpdate(req.user._id, { $inc: { followingCount: -1 } });
    await User.findByIdAndUpdate(targetId, { $inc: { followersCount: -1 } });

    res.json({ success: true, message: 'Unfollowed successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc   Get followers list
// @route  GET /api/users/:id/followers
exports.getFollowers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [follows, total] = await Promise.all([
      Follow.find({ following: req.params.id })
        .populate('follower', 'name profilePicture bio')
        .skip(skip)
        .limit(limit),
      Follow.countDocuments({ following: req.params.id }),
    ]);

    res.json({
      success: true,
      count: follows.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      followers: follows.map((f) => f.follower),
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Get following list
// @route  GET /api/users/:id/following
exports.getFollowing = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [follows, total] = await Promise.all([
      Follow.find({ follower: req.params.id })
        .populate('following', 'name profilePicture bio')
        .skip(skip)
        .limit(limit),
      Follow.countDocuments({ follower: req.params.id }),
    ]);

    res.json({
      success: true,
      count: follows.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      following: follows.map((f) => f.following),
    });
  } catch (error) {
    next(error);
  }
};
