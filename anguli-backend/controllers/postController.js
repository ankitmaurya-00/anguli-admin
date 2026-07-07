const Post = require('../models/Post');
const User = require('../models/User');
const Village = require('../models/Village');
const Comment = require('../models/Comment');
const Like = require('../models/Like');
const Share = require('../models/Share');
const Bookmark = require('../models/Bookmark');
const Follow = require('../models/Follow');
const Notification = require('../models/Notification');

// @desc   Create a post (text/image/video)
// @route  POST /api/posts
exports.createPost = async (req, res, next) => {
  try {
    const { content, village } = req.body;

    if (!content && (!req.files || req.files.length === 0)) {
      return res.status(400).json({ success: false, message: 'Post must have content or media' });
    }

    let media = [];
    let postType = 'text';
    if (req.files && req.files.length > 0) {
      media = req.files.map((f) => ({
        url: f.path,
        type: f.mimetype.startsWith('video') ? 'video' : 'image',
        publicId: f.filename,
      }));
      postType = media.length > 1 || (content && media.length >= 1) ? 'mixed' : media[0].type;
    }

    let villageData = {};
    if (village) {
      const villageDoc = await Village.findById(village);
      if (villageDoc) {
        villageData = { village: villageDoc._id, district: villageDoc.district, state: villageDoc.state };
      }
    } else if (req.user.village) {
      villageData = { village: req.user.village, district: req.user.district, state: req.user.state };
    }

    const post = await Post.create({
      author: req.user._id,
      content: content || '',
      postType,
      media,
      ...villageData,
    });

    await User.findByIdAndUpdate(req.user._id, { $inc: { postsCount: 1 } });
    if (villageData.village) {
      await Village.findByIdAndUpdate(villageData.village, { $inc: { postsCount: 1 } });
    }

    const populated = await Post.findById(post._id).populate('author', 'name profilePicture village');
    res.status(201).json({ success: true, post: populated });
  } catch (error) {
    next(error);
  }
};

// @desc   Get feed (all posts, optionally filtered by village, or personalized "following" feed)
// @route  GET /api/posts/feed
exports.getFeed = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { isHidden: false };
    if (req.query.village) filter.village = req.query.village;
    if (req.query.district) filter.district = req.query.district;
    if (req.query.state) filter.state = req.query.state;

    if (req.query.feed === 'following' && req.user) {
      const follows = await Follow.find({ follower: req.user._id }).select('following');
      const followingIds = follows.map((f) => f.following);
      followingIds.push(req.user._id);
      filter.author = { $in: followingIds };
    }

    const [posts, total] = await Promise.all([
      Post.find(filter)
        .populate('author', 'name profilePicture village')
        .populate('village', 'name slug')
        .sort('-isPinned -createdAt')
        .skip(skip)
        .limit(limit),
      Post.countDocuments(filter),
    ]);

    // Attach isLiked/isBookmarked flags if logged in
    let postsWithFlags = posts;
    if (req.user) {
      const postIds = posts.map((p) => p._id);
      const [likes, bookmarks] = await Promise.all([
        Like.find({ user: req.user._id, targetType: 'Post', targetId: { $in: postIds } }),
        Bookmark.find({ user: req.user._id, post: { $in: postIds } }),
      ]);
      const likedSet = new Set(likes.map((l) => l.targetId.toString()));
      const bookmarkedSet = new Set(bookmarks.map((b) => b.post.toString()));
      postsWithFlags = posts.map((p) => ({
        ...p.toObject(),
        isLiked: likedSet.has(p._id.toString()),
        isBookmarked: bookmarkedSet.has(p._id.toString()),
      }));
    }

    res.json({ success: true, count: posts.length, total, page, pages: Math.ceil(total / limit), posts: postsWithFlags });
  } catch (error) {
    next(error);
  }
};

// @desc   Get single post detail
// @route  GET /api/posts/:id
exports.getPost = async (req, res, next) => {
  try {
    const post = await Post.findByIdAndUpdate(req.params.id, { $inc: { viewsCount: 1 } }, { new: true })
      .populate('author', 'name profilePicture village')
      .populate('village', 'name slug');

    if (!post || post.isHidden) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    res.json({ success: true, post });
  } catch (error) {
    next(error);
  }
};

// @desc   Update own post
// @route  PUT /api/posts/:id
exports.updatePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    if (post.author.toString() !== req.user._id.toString() && req.user.role === 'user') {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this post' });
    }

    post.content = req.body.content !== undefined ? req.body.content : post.content;
    post.isEdited = true;
    post.editedAt = new Date();
    await post.save();

    res.json({ success: true, post });
  } catch (error) {
    next(error);
  }
};

// @desc   Delete own post
// @route  DELETE /api/posts/:id
exports.deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    if (post.author.toString() !== req.user._id.toString() && req.user.role === 'user') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this post' });
    }

    await post.deleteOne();
    await Comment.deleteMany({ post: post._id });
    await Like.deleteMany({ targetType: 'Post', targetId: post._id });
    await Share.deleteMany({ post: post._id });
    await Bookmark.deleteMany({ post: post._id });
    await User.findByIdAndUpdate(post.author, { $inc: { postsCount: -1 } });
    if (post.village) await Village.findByIdAndUpdate(post.village, { $inc: { postsCount: -1 } });

    res.json({ success: true, message: 'Post deleted' });
  } catch (error) {
    next(error);
  }
};

// ---------- INTERACTIONS: LIKE ----------

// @desc   Toggle like on a post or comment
// @route  POST /api/posts/:id/like  (targetType passed in body: Post|Comment)
exports.toggleLike = async (req, res, next) => {
  try {
    const targetType = req.body.targetType || 'Post';
    const targetId = req.params.id;

    const Model = targetType === 'Comment' ? Comment : Post;
    const target = await Model.findById(targetId);
    if (!target) return res.status(404).json({ success: false, message: `${targetType} not found` });

    const existing = await Like.findOne({ user: req.user._id, targetType, targetId });

    if (existing) {
      await existing.deleteOne();
      target.likesCount = Math.max(0, target.likesCount - 1);
      await target.save();
      return res.json({ success: true, liked: false, likesCount: target.likesCount });
    }

    await Like.create({ user: req.user._id, targetType, targetId });
    target.likesCount += 1;
    await target.save();

    // Notify the author (skip self-notifications)
    const authorField = targetType === 'Comment' ? target.author : target.author;
    if (authorField.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: authorField,
        sender: req.user._id,
        type: 'like',
        message: `${req.user.name} liked your ${targetType.toLowerCase()}`,
        targetType,
        targetId,
      });
    }

    res.json({ success: true, liked: true, likesCount: target.likesCount });
  } catch (error) {
    next(error);
  }
};

// ---------- INTERACTIONS: COMMENT ----------

// @desc   Add comment (or reply) to a post
// @route  POST /api/posts/:id/comments
exports.addComment = async (req, res, next) => {
  try {
    const { content, parentComment } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Comment content is required' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const comment = await Comment.create({
      post: post._id,
      author: req.user._id,
      content: content.trim(),
      parentComment: parentComment || null,
    });

    post.commentsCount += 1;
    await post.save();

    if (parentComment) {
      await Comment.findByIdAndUpdate(parentComment, { $inc: { repliesCount: 1 } });
    }

    if (post.author.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: post.author,
        sender: req.user._id,
        type: 'comment',
        message: `${req.user.name} commented on your post`,
        targetType: 'Post',
        targetId: post._id,
      });
    }

    const populated = await Comment.findById(comment._id).populate('author', 'name profilePicture');
    res.status(201).json({ success: true, comment: populated });
  } catch (error) {
    next(error);
  }
};

// @desc   Get comments for a post (with nested replies)
// @route  GET /api/posts/:id/comments
exports.getComments = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [comments, total] = await Promise.all([
      Comment.find({ post: req.params.id, parentComment: null, isHidden: false })
        .populate('author', 'name profilePicture')
        .sort('-createdAt')
        .skip(skip)
        .limit(limit),
      Comment.countDocuments({ post: req.params.id, parentComment: null, isHidden: false }),
    ]);

    res.json({ success: true, count: comments.length, total, page, pages: Math.ceil(total / limit), comments });
  } catch (error) {
    next(error);
  }
};

// @desc   Get replies for a comment
// @route  GET /api/comments/:id/replies
exports.getReplies = async (req, res, next) => {
  try {
    const replies = await Comment.find({ parentComment: req.params.id, isHidden: false })
      .populate('author', 'name profilePicture')
      .sort('createdAt');
    res.json({ success: true, count: replies.length, replies });
  } catch (error) {
    next(error);
  }
};

// @desc   Delete own comment
// @route  DELETE /api/comments/:id
exports.deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });
    if (comment.author.toString() !== req.user._id.toString() && req.user.role === 'user') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await comment.deleteOne();
    await Post.findByIdAndUpdate(comment.post, { $inc: { commentsCount: -1 } });
    res.json({ success: true, message: 'Comment deleted' });
  } catch (error) {
    next(error);
  }
};

// ---------- INTERACTIONS: SHARE ----------

// @desc   Share a post
// @route  POST /api/posts/:id/share
exports.sharePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const share = await Share.create({
      user: req.user._id,
      post: post._id,
      caption: req.body.caption || '',
      shareType: req.body.shareType || 'internal',
    });

    post.sharesCount += 1;
    await post.save();

    if (post.author.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: post.author,
        sender: req.user._id,
        type: 'share',
        message: `${req.user.name} shared your post`,
        targetType: 'Post',
        targetId: post._id,
      });
    }

    res.status(201).json({ success: true, share, sharesCount: post.sharesCount });
  } catch (error) {
    next(error);
  }
};

// ---------- BOOKMARKS ----------

// @desc   Toggle bookmark on a post
// @route  POST /api/posts/:id/bookmark
exports.toggleBookmark = async (req, res, next) => {
  try {
    const existing = await Bookmark.findOne({ user: req.user._id, post: req.params.id });
    if (existing) {
      await existing.deleteOne();
      return res.json({ success: true, bookmarked: false });
    }
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    await Bookmark.create({ user: req.user._id, post: req.params.id });
    res.status(201).json({ success: true, bookmarked: true });
  } catch (error) {
    next(error);
  }
};

// @desc   Get my bookmarked posts
// @route  GET /api/bookmarks
exports.getBookmarks = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [bookmarks, total] = await Promise.all([
      Bookmark.find({ user: req.user._id })
        .populate({ path: 'post', populate: { path: 'author', select: 'name profilePicture' } })
        .sort('-createdAt')
        .skip(skip)
        .limit(limit),
      Bookmark.countDocuments({ user: req.user._id }),
    ]);

    res.json({ success: true, count: bookmarks.length, total, page, pages: Math.ceil(total / limit), bookmarks });
  } catch (error) {
    next(error);
  }
};
