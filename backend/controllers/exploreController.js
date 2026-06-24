const Post = require('../models/Post');
const User = require('../models/User');

const getExploreData = async (req, res) => {
  try {
    const trendingPosts = await Post.find()
      .populate('user', 'username profilePicture isVerified')
      .populate('likes', 'username profilePicture isVerified');

    trendingPosts.sort((a, b) => b.likes.length - a.likes.length);
    const topPosts = trendingPosts.slice(0, 6);

    const discoverUsers = await User.find({ _id: { $ne: req.user.id } })
      .select('username profilePicture bio isVerified')
      .limit(6);

    const allPosts = await Post.find().select('caption');
    const tagCounts = {};
    allPosts.forEach((post) => {
      if (post.caption) {
        const tags = post.caption.match(/#\w+/g);
        if (tags) {
          tags.forEach((tag) => {
            const cleanTag = tag.toLowerCase().replace('#', '');
            tagCounts[cleanTag] = (tagCounts[cleanTag] || 0) + 1;
          });
        }
      }
    });

    const sortedTags = Object.keys(tagCounts)
      .map((tag) => ({ tag, count: tagCounts[tag] }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    res.status(200).json({
      trendingPosts: topPosts,
      discoverUsers,
      trendingTags: sortedTags
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getExploreData };