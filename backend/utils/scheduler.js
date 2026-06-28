const Post = require('../models/Post');

const CHECK_INTERVAL_MS = 60 * 1000;

const startScheduler = () => {
  const checkScheduledPosts = async () => {
    try {
      const now = new Date();
      const result = await Post.updateMany(
        {
          isDraft: false,
          isArchived: { $ne: true },
          scheduledAt: { $ne: null, $lte: now }
        },
        { $set: { scheduledAt: null } }
      );
      if (result.modifiedCount > 0) {
        console.log(`[Scheduler] Auto-published ${result.modifiedCount} scheduled post(s)`);
      }
    } catch (err) {
      console.error('[Scheduler] Error:', err.message);
    }
  };

  checkScheduledPosts();
  setInterval(checkScheduledPosts, CHECK_INTERVAL_MS);
  console.log('[Scheduler] Started — checking for scheduled posts every 60 seconds');
};

module.exports = { startScheduler };