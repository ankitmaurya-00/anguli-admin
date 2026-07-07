const mongoose = require('mongoose');

const shareSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
    caption: { type: String, maxlength: 500, default: '' }, // optional message added while sharing
    shareType: { type: String, enum: ['internal', 'external'], default: 'internal' },
  },
  { timestamps: true }
);

shareSchema.index({ post: 1 });
shareSchema.index({ user: 1, post: 1 });

module.exports = mongoose.model('Share', shareSchema);
