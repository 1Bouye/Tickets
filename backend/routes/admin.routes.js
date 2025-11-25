const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const {
  createUser,
  createAdmin,
  getUsers,
  updateUser,
  generateTickets,
  getTickets,
  getTicket,
  getDashboardStats,
} = require('../controllers/admin.controller');

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(authorize('admin'));

router.post('/users/create', createUser);
router.post('/admins/create', createAdmin);
router.get('/users', getUsers);
router.put('/users/:userId', updateUser);

router.post('/tickets/generate', generateTickets);
router.get('/tickets', getTickets);
router.get('/tickets/:ticketId', getTicket);

router.get('/dashboard/stats', getDashboardStats);

module.exports = router;

