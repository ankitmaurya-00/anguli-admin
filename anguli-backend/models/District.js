const mongoose = require('mongoose');
const slugify = require('slugify');

const districtSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String },
    state: { type: mongoose.Schema.Types.ObjectId, ref: 'State', required: true },
    villagesCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

districtSchema.pre('validate', function (next) {
  if (this.name) this.slug = slugify(this.name, { lower: true, strict: true });
  next();
});

districtSchema.index({ name: 'text' });
districtSchema.index({ state: 1 });
districtSchema.index({ state: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('District', districtSchema);
