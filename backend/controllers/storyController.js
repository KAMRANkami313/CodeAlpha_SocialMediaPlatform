const Story = require('../models/Story');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

const createStory = asyncHandler(async (req, res) => {
  const { image, text } = req.body;
  const newStory = new Story({
    user: req.user.id,
    image,
    text
  });
  await newStory.save();
  const populatedStory = await Story.findById(newStory._id).populate('user', 'username profilePicture isVerified');
  res.status(201).json(populatedStory);
});

const getActiveStories = asyncHandler(async (req, res) => {
  const currentUser = await User.findById(req.user.id);
  const followedUsers = [...currentUser.following, req.user.id];

  const stories = await Story.find({ user: { $in: followedUsers } })
    .sort({ createdAt: -1 })
    .populate('user', 'username profilePicture isVerified');

  const groupedStories = {};
  stories.forEach((story) => {
    const userId = story.user._id.toString();
    if (!groupedStories[userId]) {
      groupedStories[userId] = {
        user: story.user,
        stories: []
      };
    }
    groupedStories[userId].stories.push(story);
  });

  res.status(200).json(Object.values(groupedStories));
});

const createHighlight = asyncHandler(async (req, res) => {
  const { title, image, storyIds } = req.body;
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  user.highlights.push({
    title: title || '',
    image: image || '',
    storyIds: Array.isArray(storyIds) ? storyIds : []
  });
  await user.save();
  const created = user.highlights[user.highlights.length - 1];
  res.status(201).json(created);
});

const getHighlights = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.userId).select('highlights');
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  res.status(200).json(user.highlights || []);
});

const deleteHighlight = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  const highlight = user.highlights.id(req.params.highlightId);
  if (!highlight) {
    return res.status(404).json({ message: 'Highlight not found' });
  }
  user.highlights.pull(req.params.highlightId);
  await user.save();
  res.status(200).json({ message: 'Highlight deleted successfully' });
});

module.exports = {
  createStory,
  getActiveStories,
  createHighlight,
  getHighlights,
  deleteHighlight
};