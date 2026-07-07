const express = require('express');
const router = express.Router();
const {
  getStates,
  getDistrictsByState,
  getVillagesByDistrict,
  getVillages,
  getVillageBySlug,
} = require('../controllers/villageController');

router.get('/states', getStates);
router.get('/states/:stateId/districts', getDistrictsByState);
router.get('/districts/:districtId/villages', getVillagesByDistrict);
router.get('/villages', getVillages);
router.get('/villages/:slug', getVillageBySlug);

module.exports = router;
