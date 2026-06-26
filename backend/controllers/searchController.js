const User = require('../models/User');
const Post = require('../models/Post');
const asyncHandler = require('../utils/asyncHandler');

const searchAll = asyncHandler(async (req, res) => {
  const { q, type } = req.query;
  if (!q) {
    return res.status(200).json({ users: [], posts: [], tags: [] });
  }

  const searchType = type || 'all';

  let users = [];
  let posts = [];
  let tags = [];

  if (searchType === 'all' || searchType === 'users') {
    users = await User.find({
      $or: [
        { username: { $regex: q, $options: 'i' } },
        { bio: { $regex: q, $options: 'i' } }
      ]
    }).select('username profilePicture bio isVerified').limit(10);
  }

  if (searchType === 'all' || searchType === 'posts') {
    posts = await Post.find({
      caption: { $regex: q, $options: 'i' }
    })
      .populate('user', 'username profilePicture isVerified')
      .sort({ createdAt: -1 })
      .limit(10);
  }

  if (searchType === 'all' || searchType === 'tags') {
    const tagQuery = q.startsWith('#') ? q.slice(1) : q;
    const allPosts = await Post.find({
      caption: { $regex: `#${tagQuery}`, $options: 'i' }
    }).select('caption');

    const tagCounts = {};
    allPosts.forEach((post) => {
      if (post.caption) {
        const matches = post.caption.match(/#\w+/g);
        if (matches) {
          matches.forEach((tag) => {
            const cleanTag = tag.toLowerCase().replace('#', '');
            if (cleanTag.includes(tagQuery.toLowerCase())) {
              tagCounts[cleanTag] = (tagCounts[cleanTag] || 0) + 1;
            }
          });
        }
      }
    });

    tags = Object.keys(tagCounts)
      .map((tag) => ({ tag, count: tagCounts[tag] }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  res.status(200).json({ users, posts, tags });
});

module.exports = { searchAll };