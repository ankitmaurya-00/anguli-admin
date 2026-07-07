const express = require('express');
const router = express.Router();
const {
  createPost,
  getFeed,
  getPost,
  updatePost,
  deletePost,
  toggleLike,
  addComment,
  getComments,
  getReplies,
  deleteComment,
  sharePost,
  toggleBookmark,
  getBookmarks,
} = require('../controllers/postController');
const { protect, optionalAuth } = require('../middleware/auth');
const { uploadPostMedia } = require('../config/cloudinary');

router.get('/feed', optionalAuth, getFeed);
router.get('/bookmarks/me', protect, getBookmarks);

router.post('/', protect, uploadPostMedia.array('media', 5), createPost);
router.get('/:id', optionalAuth, getPost);
router.put('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);

router.post('/:id/like', protect, toggleLike);
router.post('/:id/comments', protect, addComment);
router.get('/:id/comments', getComments);
router.post('/:id/share', protect, sharePost);
router.post('/:id/bookmark', protect, toggleBookmark);

module.exports = router;
