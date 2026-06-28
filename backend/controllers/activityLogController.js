const UserActivity = require('../models/UserActivity');
const asyncHandler = require('../utils/asyncHandler');

const getActivityLog = asyncHandler(async (req, res) => {
  const limit = Math.min(50, parseInt(req.query.limit) || 20);

  const activities = await UserActivity.find({ user: req.user.id })
    .sort({ timestamp: -1 })
    .limit(limit)
    .select('ip deviceName browser os loginMethod timestamp');

  res.status(200).json(activities);
});

module.exports = {
  getActivityLog
};