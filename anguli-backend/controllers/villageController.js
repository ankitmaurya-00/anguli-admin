const State = require('../models/State');
const District = require('../models/District');
const Village = require('../models/Village');

// ---------- PUBLIC: VILLAGE DIRECTORY ----------

// @desc   Get all states
// @route  GET /api/states
exports.getStates = async (req, res, next) => {
  try {
    const states = await State.find({ isActive: true }).sort('name');
    res.json({ success: true, count: states.length, states });
  } catch (error) {
    next(error);
  }
};

// @desc   Get districts by state
// @route  GET /api/states/:stateId/districts
exports.getDistrictsByState = async (req, res, next) => {
  try {
    const districts = await District.find({ state: req.params.stateId, isActive: true }).sort('name');
    res.json({ success: true, count: districts.length, districts });
  } catch (error) {
    next(error);
  }
};

// @desc   Get villages by district
// @route  GET /api/districts/:districtId/villages
exports.getVillagesByDistrict = async (req, res, next) => {
  try {
    const villages = await Village.find({ district: req.params.districtId, isActive: true }).sort('name');
    res.json({ success: true, count: villages.length, villages });
  } catch (error) {
    next(error);
  }
};

// @desc   List villages with pagination + filters (Village Directory listing page)
// @route  GET /api/villages
exports.getVillages = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = { isActive: true };
    if (req.query.state) filter.state = req.query.state;
    if (req.query.district) filter.district = req.query.district;
    if (req.query.featured === 'true') filter.isFeatured = true;

    const [villages, total] = await Promise.all([
      Village.find(filter)
        .populate('district', 'name')
        .populate('state', 'name')
        .sort('-isFeatured name')
        .skip(skip)
        .limit(limit),
      Village.countDocuments(filter),
    ]);

    res.json({
      success: true,
      count: villages.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      villages,
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Get single village detail page
// @route  GET /api/villages/:slug
exports.getVillageBySlug = async (req, res, next) => {
  try {
    const village = await Village.findOne({ slug: req.params.slug })
      .populate('district', 'name slug')
      .populate('state', 'name slug');

    if (!village) {
      return res.status(404).json({ success: false, message: 'Village not found' });
    }
    res.json({ success: true, village });
  } catch (error) {
    next(error);
  }
};

// ---------- ADMIN: CORE MASTER DATA CRUD ----------

exports.createState = async (req, res, next) => {
  try {
    const state = await State.create(req.body);
    res.status(201).json({ success: true, state });
  } catch (error) {
    next(error);
  }
};

exports.updateState = async (req, res, next) => {
  try {
    const state = await State.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!state) return res.status(404).json({ success: false, message: 'State not found' });
    res.json({ success: true, state });
  } catch (error) {
    next(error);
  }
};

exports.deleteState = async (req, res, next) => {
  try {
    const districtCount = await District.countDocuments({ state: req.params.id });
    if (districtCount > 0) {
      return res.status(400).json({ success: false, message: 'Cannot delete state with existing districts' });
    }
    const state = await State.findByIdAndDelete(req.params.id);
    if (!state) return res.status(404).json({ success: false, message: 'State not found' });
    res.json({ success: true, message: 'State deleted' });
  } catch (error) {
    next(error);
  }
};

exports.createDistrict = async (req, res, next) => {
  try {
    const district = await District.create(req.body);
    await State.findByIdAndUpdate(district.state, { $inc: { districtsCount: 1 } });
    res.status(201).json({ success: true, district });
  } catch (error) {
    next(error);
  }
};

exports.updateDistrict = async (req, res, next) => {
  try {
    const district = await District.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!district) return res.status(404).json({ success: false, message: 'District not found' });
    res.json({ success: true, district });
  } catch (error) {
    next(error);
  }
};

exports.deleteDistrict = async (req, res, next) => {
  try {
    const villageCount = await Village.countDocuments({ district: req.params.id });
    if (villageCount > 0) {
      return res.status(400).json({ success: false, message: 'Cannot delete district with existing villages' });
    }
    const district = await District.findByIdAndDelete(req.params.id);
    if (!district) return res.status(404).json({ success: false, message: 'District not found' });
    await State.findByIdAndUpdate(district.state, { $inc: { districtsCount: -1 } });
    res.json({ success: true, message: 'District deleted' });
  } catch (error) {
    next(error);
  }
};

exports.createVillage = async (req, res, next) => {
  try {
    const district = await District.findById(req.body.district);
    if (!district) return res.status(400).json({ success: false, message: 'Invalid district' });

    const village = await Village.create({ ...req.body, state: district.state });
    await District.findByIdAndUpdate(district._id, { $inc: { villagesCount: 1 } });
    await State.findByIdAndUpdate(district.state, { $inc: { villagesCount: 1 } });

    res.status(201).json({ success: true, village });
  } catch (error) {
    next(error);
  }
};

exports.updateVillage = async (req, res, next) => {
  try {
    const village = await Village.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!village) return res.status(404).json({ success: false, message: 'Village not found' });
    res.json({ success: true, village });
  } catch (error) {
    next(error);
  }
};

exports.deleteVillage = async (req, res, next) => {
  try {
    const village = await Village.findByIdAndDelete(req.params.id);
    if (!village) return res.status(404).json({ success: false, message: 'Village not found' });
    await District.findByIdAndUpdate(village.district, { $inc: { villagesCount: -1 } });
    await State.findByIdAndUpdate(village.state, { $inc: { villagesCount: -1 } });
    res.json({ success: true, message: 'Village deleted' });
  } catch (error) {
    next(error);
  }
};

// Admin: list all (including inactive) with pagination - used by admin panel tables
exports.adminListStates = async (req, res, next) => {
  try {
    const states = await State.find().sort('name');
    res.json({ success: true, states });
  } catch (error) {
    next(error);
  }
};

exports.adminListDistricts = async (req, res, next) => {
  try {
    const filter = req.query.state ? { state: req.query.state } : {};
    const districts = await District.find(filter).populate('state', 'name').sort('name');
    res.json({ success: true, districts });
  } catch (error) {
    next(error);
  }
};

exports.adminListVillages = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    const filter = {};
    if (req.query.district) filter.district = req.query.district;
    if (req.query.state) filter.state = req.query.state;

    const [villages, total] = await Promise.all([
      Village.find(filter).populate('district', 'name').populate('state', 'name').sort('-createdAt').skip(skip).limit(limit),
      Village.countDocuments(filter),
    ]);
    res.json({ success: true, count: villages.length, total, page, pages: Math.ceil(total / limit), villages });
  } catch (error) {
    next(error);
  }
};
