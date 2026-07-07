const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, trim: true, maxlength: 5000, default: '' },

    postType: { type: String, enum: ['text', 'image', 'video', 'mixed'], default: 'text' },
    media: [
      {
        url: { type: String, required: true },
        type: { type: String, enum: ['image', 'video'], required: true },
        publicId: { type: String }, // cloudinary public_id for deletion
      },
    ],

    // Location tagging - ties post to a village (community feed)
    village: { type: mongoose.Schema.Types.ObjectId, ref: 'Village' },
    district: { type: mongoose.Schema.Types.ObjectId, ref: 'District' },
    state: { type: mongoose.Schema.Types.ObjectId, ref: 'State' },

    // Denormalized counts for fast feed rendering
    likesCount: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
    sharesCount: { type: Number, default: 0 },
    viewsCount: { type: Number, default: 0 },

    isEdited: { type: Boolean, default: false },
    editedAt: { type: Date },

    // Moderation
    isReported: { type: Boolean, default: false },
    reportsCount: { type: Number, default: 0 },
    isHidden: { type: Boolean, default: false },
    isPinned: { type: Boolean, default: false },
  },
  { timestamps: true }
);

postSchema.index({ content: 'text' });
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ village: 1, createdAt: -1 });
postSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Post', postSchema);
