const Village = require('../models/Village');
const User = require('../models/User');
const Post = require('../models/Post');

// @desc   Global search across villages (Phase 1) and optionally users/posts (Phase 2)
// @route  GET /api/search?q=&state=&district=&type=
exports.search = async (req, res, next) => {
  try {
    const { q = '', state, district, type = 'villages' } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    if (type === 'villages') {
      const filter = { isActive: true };
      if (state) filter.state = state;
      if (district) filter.district = district;
      if (q) filter.$text = { $search: q };

      const [results, total] = await Promise.all([
        Village.find(filter)
          .populate('district', 'name')
          .populate('state', 'name')
          .skip(skip)
          .limit(limit),
        Village.countDocuments(filter),
      ]);
      return res.json({ success: true, type: 'villages', count: results.length, total, page, pages: Math.ceil(total / limit), results });
    }

    if (type === 'users') {
      const filter = { isBanned: false };
      if (state) filter.state = state;
      if (district) filter.district = district;
      if (q) filter.$text = { $search: q };

      const [results, total] = await Promise.all([
        User.find(filter).select('name bio profilePicture village district state followersCount').skip(skip).limit(limit),
        User.countDocuments(filter),
      ]);
      return res.json({ success: true, type: 'users', count: results.length, total, page, pages: Math.ceil(total / limit), results });
    }

    if (type === 'posts') {
      const filter = { isHidden: false };
      if (state) filter.state = state;
      if (district) filter.district = district;
      if (q) filter.$text = { $search: q };

      const [results, total] = await Promise.all([
        Post.find(filter)
          .populate('author', 'name profilePicture')
          .populate('village', 'name slug')
          .sort('-createdAt')
          .skip(skip)
          .limit(limit),
        Post.countDocuments(filter),
      ]);
      return res.json({ success: true, type: 'posts', count: results.length, total, page, pages: Math.ceil(total / limit), results });
    }

    res.status(400).json({ success: false, message: 'Invalid search type. Use villages, users, or posts.' });
  } catch (error) {
    next(error);
  }
};
