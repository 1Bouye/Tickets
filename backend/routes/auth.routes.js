const express = require('express');
const router = express.Router();
const { adminLogin, userLogin, staffLogin } = require('../controllers/auth.controller');

router.post('/admin-login', adminLogin);
router.post('/user-login', userLogin);
router.post('/staff-login', staffLogin);

module.exports = router;

