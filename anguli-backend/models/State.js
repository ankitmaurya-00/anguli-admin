const mongoose = require('mongoose');
const slugify = require('slugify');

const stateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, unique: true },
    code: { type: String, trim: true, uppercase: true }, // e.g. UP, MH
    districtsCount: { type: Number, default: 0 },
    villagesCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

stateSchema.pre('validate', function (next) {
  if (this.name) this.slug = slugify(this.name, { lower: true, strict: true });
  next();
});

module.exports = mongoose.model('State', stateSchema);
