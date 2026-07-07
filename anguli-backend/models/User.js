const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ['user', 'admin', 'moderator'], default: 'user' },

    // Profile fields (Phase 2 - User Profile module)
    bio: { type: String, maxlength: 300, default: '' },
    profilePicture: { type: String, default: '' }, // Cloudinary URL
    coverPhoto: { type: String, default: '' },
    socialLinks: {
      facebook: { type: String, default: '' },
      instagram: { type: String, default: '' },
      twitter: { type: String, default: '' },
      website: { type: String, default: '' },
    },

    // Location linkage
    village: { type: mongoose.Schema.Types.ObjectId, ref: 'Village' },
    district: { type: mongoose.Schema.Types.ObjectId, ref: 'District' },
    state: { type: mongoose.Schema.Types.ObjectId, ref: 'State' },

    // Counters (denormalized for fast reads)
    followersCount: { type: Number, default: 0 },
    followingCount: { type: Number, default: 0 },
    postsCount: { type: Number, default: 0 },

    isVerified: { type: Boolean, default: false },
    isBanned: { type: Boolean, default: false },
    banReason: { type: String, default: '' },

    lastLogin: { type: Date },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

userSchema.index({ email: 1 });
userSchema.index({ name: 'text', bio: 'text' });

module.exports = mongoose.model('User', userSchema);
