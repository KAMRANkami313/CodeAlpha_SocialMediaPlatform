const express = require('express');
const router = express.Router();
const {
  createStory,
  getActiveStories,
  createHighlight,
  getHighlights,
  deleteHighlight
} = require('../controllers/storyController');
const auth = require('../middlewares/auth');

router.post('/', auth, createStory);
router.get('/', auth, getActiveStories);
router.post('/highlights', auth, createHighlight);
router.get('/highlights/:userId', auth, getHighlights);
router.delete('/highlights/:highlightId', auth, deleteHighlight);

module.exports = router;