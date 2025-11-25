const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authConfig = require('../config/auth');
const { sendSuccess, sendError } = require('../utils/response.util');

// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign({ id: user._id.toString(), userId: user.userId, role: user.role }, authConfig.JWT_SECRET, {
    expiresIn: authConfig.JWT_EXPIRE,
  });
};

// Admin Login
exports.adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return sendError(res, 'Please provide username and password', 'VALIDATION_ERROR', 400);
    }

    const user = await User.findOne({ userId: username, role: 'admin' });

    if (!user || !(await user.comparePassword(password))) {
      return sendError(res, 'Invalid credentials', 'AUTH_FAILED', 401);
    }

    const token = generateToken(user);

    sendSuccess(res, {
      token,
      user: {
        userId: user.userId,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    sendError(res, error.message, 'SERVER_ERROR', 500);
  }
};

// User Login
exports.userLogin = async (req, res) => {
  try {
    const { userId, password } = req.body;

    if (!userId || !password) {
      return sendError(res, 'Please provide userId and password', 'VALIDATION_ERROR', 400);
    }

    const user = await User.findOne({ userId, role: 'user' });

    if (!user) {
      return sendError(res, 'Invalid credentials', 'AUTH_FAILED', 401);
    }

    if (!user.isActive) {
      return sendError(res, 'Account is deactivated', 'AUTH_FAILED', 401);
    }

    if (!(await user.comparePassword(password))) {
      return sendError(res, 'Invalid credentials', 'AUTH_FAILED', 401);
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user);

    sendSuccess(res, {
      token,
      user: {
        userId: user.userId,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    sendError(res, error.message, 'SERVER_ERROR', 500);
  }
};

// Staff Login
exports.staffLogin = async (req, res) => {
  try {
    const { userId, password } = req.body;

    if (!userId || !password) {
      return sendError(res, 'Please provide userId and password', 'VALIDATION_ERROR', 400);
    }

    const user = await User.findOne({ userId, role: 'staff' });

    if (!user || !(await user.comparePassword(password))) {
      return sendError(res, 'Invalid credentials', 'AUTH_FAILED', 401);
    }

    const token = generateToken(user);

    sendSuccess(res, {
      token,
      user: {
        userId: user.userId,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    sendError(res, error.message, 'SERVER_ERROR', 500);
  }
};

