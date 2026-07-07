const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    type: {
      type: String,
      enum: ['like', 'comment', 'share', 'follow', 'reply', 'mention', 'system'],
      required: true,
    },
    message: { type: String, required: true },

    // Polymorphic reference to the relevant entity (post/comment)
    targetType: { type: String, enum: ['Post', 'Comment', 'User', null], default: null },
    targetId: { type: mongoose.Schema.Types.ObjectId },

    isRead: { type: Boolean, default: false },
    emailSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
