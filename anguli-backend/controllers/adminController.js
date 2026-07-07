const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Village = require('../models/Village');
const State = require('../models/State');
const District = require('../models/District');
const Report = require('../models/Report');

// @desc   Admin dashboard summary stats
// @route  GET /api/admin/dashboard
exports.getDashboardStats = async (req, res, next) => {
  try {
    const [totalUsers, totalPosts, totalVillages, totalStates, totalDistricts, pendingReports, bannedUsers] = await Promise.all([
      User.countDocuments(),
      Post.countDocuments(),
      Village.countDocuments(),
      State.countDocuments(),
      District.countDocuments(),
      Report.countDocuments({ status: 'pending' }),
      User.countDocuments({ isBanned: true }),
    ]);

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const [newUsersThisWeek, newPostsThisWeek] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      Post.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalPosts,
        totalVillages,
        totalStates,
        totalDistricts,
        pendingReports,
        bannedUsers,
        newUsersThisWeek,
        newPostsThisWeek,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ---------- USER MANAGEMENT ----------

// @desc   List all users with search/pagination
// @route  GET /api/admin/users
exports.listUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
      ];
    }
    if (req.query.role) filter.role = req.query.role;
    if (req.query.banned === 'true') filter.isBanned = true;

    const [users, total] = await Promise.all([
      User.find(filter).sort('-createdAt').skip(skip).limit(limit),
      User.countDocuments(filter),
    ]);

    res.json({ success: true, count: users.length, total, page, pages: Math.ceil(total / limit), users });
  } catch (error) {
    next(error);
  }
};

// @desc   Ban a user
// @route  PUT /api/admin/users/:id/ban
exports.banUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBanned: true, banReason: req.body.reason || 'Violation of community guidelines' },
      { new: true }
    );
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'User banned', user });
  } catch (error) {
    next(error);
  }
};

// @desc   Unban a user
// @route  PUT /api/admin/users/:id/unban
exports.unbanUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isBanned: false, banReason: '' }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'User unbanned', user });
  } catch (error) {
    next(error);
  }
};

// @desc   Change user role (promote to admin/moderator)
// @route  PUT /api/admin/users/:id/role
exports.updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin', 'moderator'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc   Delete a user (admin only, permanent)
// @route  DELETE /api/admin/users/:id
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    await Post.deleteMany({ author: user._id });
    await Comment.deleteMany({ author: user._id });
    res.json({ success: true, message: 'User and their content deleted' });
  } catch (error) {
    next(error);
  }
};

// ---------- CONTENT MODERATION ----------

// @desc   List all posts for moderation
// @route  GET /api/admin/posts
exports.listAllPosts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.reported === 'true') filter.isReported = true;
    if (req.query.hidden === 'true') filter.isHidden = true;

    const [posts, total] = await Promise.all([
      Post.find(filter).populate('author', 'name email').sort('-createdAt').skip(skip).limit(limit),
      Post.countDocuments(filter),
    ]);

    res.json({ success: true, count: posts.length, total, page, pages: Math.ceil(total / limit), posts });
  } catch (error) {
    next(error);
  }
};

// @desc   Hide/unhide a post (moderation action)
// @route  PUT /api/admin/posts/:id/toggle-hide
exports.togglePostVisibility = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    post.isHidden = !post.isHidden;
    await post.save();
    res.json({ success: true, isHidden: post.isHidden });
  } catch (error) {
    next(error);
  }
};

// @desc   Pin/unpin a post
// @route  PUT /api/admin/posts/:id/toggle-pin
exports.togglePostPin = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    post.isPinned = !post.isPinned;
    await post.save();
    res.json({ success: true, isPinned: post.isPinned });
  } catch (error) {
    next(error);
  }
};

// @desc   Delete any post (admin override)
// @route  DELETE /api/admin/posts/:id
exports.adminDeletePost = async (req, res, next) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    await Comment.deleteMany({ post: post._id });
    res.json({ success: true, message: 'Post deleted by admin' });
  } catch (error) {
    next(error);
  }
};

// ---------- REPORTS ----------

// @desc   Create a report (any logged-in user)
// @route  POST /api/reports
exports.createReport = async (req, res, next) => {
  try {
    const { targetType, targetId, reason, details } = req.body;
    if (!targetType || !targetId || !reason) {
      return res.status(400).json({ success: false, message: 'targetType, targetId and reason are required' });
    }

    const report = await Report.create({
      reporter: req.user._id,
      targetType,
      targetId,
      reason,
      details: details || '',
    });

    if (targetType === 'Post') {
      await Post.findByIdAndUpdate(targetId, { isReported: true, $inc: { reportsCount: 1 } });
    }

    res.status(201).json({ success: true, report });
  } catch (error) {
    next(error);
  }
};

// @desc   List all reports (admin)
// @route  GET /api/admin/reports
exports.listReports = async (req, res, next) => {
  try {
    const filter = req.query.status ? { status: req.query.status } : {};
    const reports = await Report.find(filter)
      .populate('reporter', 'name email')
      .sort('-createdAt');
    res.json({ success: true, count: reports.length, reports });
  } catch (error) {
    next(error);
  }
};

// @desc   Update report status (review/dismiss/action_taken)
// @route  PUT /api/admin/reports/:id
exports.updateReportStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['pending', 'reviewed', 'dismissed', 'action_taken'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status, reviewedBy: req.user._id },
      { new: true }
    );
    if (!report) return res.status(404).json({ success: false, message: 'Report not found' });
    res.json({ success: true, report });
  } catch (error) {
    next(error);
  }
};
