const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getReports,
  takeReportAction,
  getUsers,
  suspendUser,
  unsuspendUser,
  setUserRole,
  deleteUser
} = require('../controllers/adminController');
const auth = require('../middlewares/auth');
const { requireAdmin } = require('../middlewares/admin');

router.use(auth, requireAdmin);

router.get('/stats', getDashboardStats);
router.get('/reports', getReports);
router.post('/reports/:id/action', takeReportAction);
router.get('/users', getUsers);
router.post('/users/:userId/suspend', suspendUser);
router.post('/users/:userId/unsuspend', unsuspendUser);
router.put('/users/:userId/role', setUserRole);
router.delete('/users/:userId', deleteUser);

module.exports = router;