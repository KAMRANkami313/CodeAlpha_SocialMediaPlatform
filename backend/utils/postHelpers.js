const Post = require('../models/Post');

const POST_USER_SELECT = 'username profilePicture isVerified';
const COMMENT_USER_SELECT = 'username profilePicture isVerified';

const populatePost = (query) => {
  return query
    .populate('user', POST_USER_SELECT)
    .populate('likes', POST_USER_SELECT)
    .populate({
      path: 'comments',
      populate: {
        path: 'user',
        select: COMMENT_USER_SELECT
      }
    });
};

const findPostByIdPopulated = (postId) => populatePost(Post.findById(postId));

const findPostsPopulated = (filter = {}) => populatePost(Post.find(filter));

module.exports = {
  populatePost,
  findPostByIdPopulated,
  findPostsPopulated
};