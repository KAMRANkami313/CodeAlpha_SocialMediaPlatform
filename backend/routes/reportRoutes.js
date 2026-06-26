const express = require('express');
const router = express.Router();
const { createReport, getReports, updateReportStatus } = require('../controllers/reportController');
const auth = require('../middlewares/auth');

router.post('/', auth, createReport);
router.get('/', auth, getReports);
router.put('/:id/status', auth, updateReportStatus);

module.exports = router;