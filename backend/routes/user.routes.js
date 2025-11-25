const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const {
  getAvailableTicket,
  purchaseTicket,
  getMyTicket,
  getTicketHistory,
} = require('../controllers/user.controller');

// All user routes require authentication and user role
router.use(authenticate);
router.use(authorize('user'));

router.get('/tickets/available', getAvailableTicket);
router.post('/tickets/purchase', purchaseTicket);
router.get('/tickets/my-ticket', getMyTicket);
router.get('/tickets/history', getTicketHistory);

module.exports = router;

