const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const {
  validateTicket,
  getScanLogs,
  getScannerStats,
  getCurrentUser,
} = require('../controllers/scanner.controller');

// All scanner routes require authentication and staff role
router.use(authenticate);
router.use(authorize('staff'));

router.get('/me', getCurrentUser);
router.post('/validate', validateTicket);
router.get('/logs', getScanLogs);
router.get('/stats', getScannerStats);

module.exports = router;

