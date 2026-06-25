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

module.exports = {
  createStory,
  getActiveStories
};