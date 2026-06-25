const User = require('../models/User');
const Notification = require('../models/Notification');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email or username already exists' });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({
      username,
      email,
      password: hashedPassword
    });
    await newUser.save();
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(200).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        bio: user.bio,
        profilePicture: user.profilePicture,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    let userProfile = await User.findById(req.params.id);
    if (!userProfile) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (req.user && req.user.id !== req.params.id && !userProfile.views.includes(req.user.id)) {
      userProfile.views.push(req.user.id);
      await userProfile.save();
    }

    userProfile = await User.findById(req.params.id)
      .select('-password')
      .populate('followers', 'username profilePicture isVerified')
      .populate('following', 'username profilePicture isVerified')
      .populate({
        path: 'savedPosts',
        populate: {
          path: 'user',
          select: 'username profilePicture isVerified'
        }
      });

    res.status(200).json(userProfile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { username, email, bio, profilePicture, isVerified } = req.body;

    if (username) {
      const existingUser = await User.findOne({ username, _id: { $ne: req.user.id } });
      if (existingUser) {
        return res.status(400).json({ message: 'Username is already taken' });
      }
    }

    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: req.user.id } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email is already in use' });
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { username, email, bio, profilePicture, isVerified },
      { new: true }
    ).select('-password');
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const followUser = async (req, res) => {
  try {
    if (req.user.id === req.params.id) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }
    const targetUser = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (currentUser.following.includes(req.params.id)) {
      return res.status(400).json({ message: 'You already follow this user' });
    }
    currentUser.following.push(req.params.id);
    targetUser.followers.push(req.user.id);
    await currentUser.save();
    await targetUser.save();

    const notification = new Notification({
      sender: req.user.id,
      receiver: req.params.id,
      type: 'follow'
    });
    await notification.save();

    res.status(200).json({ message: 'User followed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const unfollowUser = async (req, res) => {
  try {
    if (req.user.id === req.params.id) {
      return res.status(400).json({ message: 'You cannot unfollow yourself' });
    }
    const targetUser = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (!currentUser.following.includes(req.params.id)) {
      return res.status(400).json({ message: 'You are not following this user' });
    }
    currentUser.following = currentUser.following.filter(id => id.toString() !== req.params.id);
    targetUser.followers = targetUser.followers.filter(id => id.toString() !== req.user.id);
    await currentUser.save();
    await targetUser.save();
    res.status(200).json({ message: 'User unfollowed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const saveUnsavePost = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.savedPosts.includes(req.params.postId)) {
      user.savedPosts = user.savedPosts.filter(id => id.toString() !== req.params.postId);
      await user.save();
      return res.status(200).json({ message: 'Post unsaved successfully', savedPosts: user.savedPosts });
    } else {
      user.savedPosts.push(req.params.postId);
      await user.save();
      return res.status(200).json({ message: 'Post saved successfully', savedPosts: user.savedPosts });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const searchUsers = async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) {
      return res.status(200).json([]);
    }
    const users = await User.find({
      username: { $regex: query, $options: 'i' }
    }).select('username profilePicture bio isVerified');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSuggestedUsers = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    const excludedUsers = [...currentUser.following, req.user.id];
    const suggestions = await User.find({ _id: { $nin: excludedUsers } })
      .select('username profilePicture bio isVerified')
      .limit(5);
    res.status(200).json(suggestions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  followUser,
  unfollowUser,
  saveUnsavePost,
  searchUsers,
  getSuggestedUsers
};