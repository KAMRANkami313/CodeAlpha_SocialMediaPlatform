const express = require('express');
const router = express.Router();
const { createStory, getActiveStories } = require('../controllers/storyController');
const auth = require('../middlewares/auth');

router.post('/', auth, createStory);
router.get('/', auth, getActiveStories);

module.exports = router;