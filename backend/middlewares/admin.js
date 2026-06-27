const User = require('../models/User');

const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    const user = await User.findById(req.user.id).select('role isSuspended');
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    if (user.isSuspended) {
      return res.status(403).json({ message: 'Account suspended' });
    }
    if (user.role !== 'admin' && user.role !== 'super_admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    req.user.role = user.role;
    next();
  } catch (err) {
    next(err);
  }
};

const requireSuperAdmin = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    const user = await User.findById(req.user.id).select('role isSuspended');
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    if (user.isSuspended) {
      return res.status(403).json({ message: 'Account suspended' });
    }
    if (user.role !== 'super_admin') {
      return res.status(403).json({ message: 'Super admin access required' });
    }
    req.user.role = user.role;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { requireAdmin, requireSuperAdmin };