const express = require('express');
const router = express.Router();
const { getReplies, deleteComment } = require('../controllers/postController');
const { protect } = require('../middleware/auth');

router.get('/:id/replies', getReplies);
router.delete('/:id', protect, deleteComment);

module.exports = router;
