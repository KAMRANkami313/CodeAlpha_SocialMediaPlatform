const express = require('express');
const router = express.Router();
const { getExploreData } = require('../controllers/exploreController');
const auth = require('../middlewares/auth');

router.get('/', auth, getExploreData);

module.exports = router;