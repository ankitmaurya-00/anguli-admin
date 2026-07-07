const mongoose = require('mongoose');
const slugify = require('slugify');

const villageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String },
    district: { type: mongoose.Schema.Types.ObjectId, ref: 'District', required: true },
    state: { type: mongoose.Schema.Types.ObjectId, ref: 'State', required: true },

    // Village Directory detail page fields
    description: { type: String, default: '', maxlength: 2000 },
    population: { type: Number, default: 0 },
    pincode: { type: String, default: '' },
    coverImage: { type: String, default: '' }, // Cloudinary URL
    latitude: { type: Number },
    longitude: { type: Number },

    // Stats
    membersCount: { type: Number, default: 0 },
    postsCount: { type: Number, default: 0 },

    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

villageSchema.pre('validate', function (next) {
  if (this.name) this.slug = slugify(this.name, { lower: true, strict: true });
  next();
});

villageSchema.index({ name: 'text', description: 'text' });
villageSchema.index({ state: 1, district: 1 });
villageSchema.index({ district: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Village', villageSchema);
