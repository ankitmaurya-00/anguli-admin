const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

const {
  getDashboardStats,
  listUsers,
  banUser,
  unbanUser,
  updateUserRole,
  deleteUser,
  listAllPosts,
  togglePostVisibility,
  togglePostPin,
  adminDeletePost,
  listReports,
  updateReportStatus,
} = require('../controllers/adminController');

const {
  createState,
  updateState,
  deleteState,
  createDistrict,
  updateDistrict,
  deleteDistrict,
  createVillage,
  updateVillage,
  deleteVillage,
  adminListStates,
  adminListDistricts,
  adminListVillages,
} = require('../controllers/villageController');

const { uploadPostMedia } = require('../config/cloudinary');

// All admin routes require admin or moderator role
router.use(protect, authorize('admin', 'moderator'));

// Dashboard
router.get('/dashboard', getDashboardStats);

// User management (moderator can view, only admin can ban/delete/change role)
router.get('/users', listUsers);
router.put('/users/:id/ban', authorize('admin', 'moderator'), banUser);
router.put('/users/:id/unban', authorize('admin', 'moderator'), unbanUser);
router.put('/users/:id/role', authorize('admin'), updateUserRole);
router.delete('/users/:id', authorize('admin'), deleteUser);

// Content moderation
router.get('/posts', listAllPosts);
router.put('/posts/:id/toggle-hide', togglePostVisibility);
router.put('/posts/:id/toggle-pin', togglePostPin);
router.delete('/posts/:id', adminDeletePost);

// Reports
router.get('/reports', listReports);
router.put('/reports/:id', updateReportStatus);

// Master data - States
router.get('/states', adminListStates);
router.post('/states', authorize('admin'), createState);
router.put('/states/:id', authorize('admin'), updateState);
router.delete('/states/:id', authorize('admin'), deleteState);

// Master data - Districts
router.get('/districts', adminListDistricts);
router.post('/districts', authorize('admin'), createDistrict);
router.put('/districts/:id', authorize('admin'), updateDistrict);
router.delete('/districts/:id', authorize('admin'), deleteDistrict);

// Master data - Villages
router.get('/villages', adminListVillages);
router.post('/villages', authorize('admin'), uploadPostMedia.single('coverImage'), createVillage);
router.put('/villages/:id', authorize('admin'), uploadPostMedia.single('coverImage'), updateVillage);
router.delete('/villages/:id', authorize('admin'), deleteVillage);

module.exports = router;
