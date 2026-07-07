const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  updateProfile,
  updateProfilePicture,
  updateCoverPhoto,
  getUserPosts,
  getMyActivity,
} = require('../controllers/userController');
const { followUser, unfollowUser, getFollowers, getFollowing } = require('../controllers/followController');
const { protect, optionalAuth } = require('../middleware/auth');
const { uploadProfilePic } = require('../config/cloudinary');

router.put('/me', protect, updateProfile);
router.put('/me/profile-picture', protect, uploadProfilePic.single('image'), updateProfilePicture);
router.put('/me/cover-photo', protect, uploadProfilePic.single('image'), updateCoverPhoto);
router.get('/me/activity', protect, getMyActivity);

router.get('/:id', optionalAuth, getUserProfile);
router.get('/:id/posts', getUserPosts);
router.post('/:id/follow', protect, followUser);
router.delete('/:id/follow', protect, unfollowUser);
router.get('/:id/followers', getFollowers);
router.get('/:id/following', getFollowing);

module.exports = router;
