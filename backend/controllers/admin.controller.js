const User = require('../models/User');
const Ticket = require('../models/Ticket');
const ScanLog = require('../models/ScanLog');
const { v4: uuidv4 } = require('uuid');
const { format, startOfDay, endOfDay } = require('date-fns');
const { generateQRCodeData } = require('../utils/qrcode.util');
const { generatePassword } = require('../utils/password.util');
const { sendSuccess, sendError } = require('../utils/response.util');

// Create User
exports.createUser = async (req, res) => {
  try {
    const { userId, name, userType } = req.body;

    if (!userId || !name || !userType) {
      return sendError(res, 'Please provide userId, name, and userType', 'VALIDATION_ERROR', 400);
    }

    if (!['student', 'professor', 'universityEmployee', 'staff'].includes(userType)) {
      return sendError(res, 'Invalid userType. Must be: student, professor, universityEmployee, or staff', 'VALIDATION_ERROR', 400);
    }

    const existingUser = await User.findOne({ userId });
    if (existingUser) {
      return sendError(res, 'User ID already exists', 'ALREADY_EXISTS', 400);
    }

    // Auto-generate password (6-8 characters)
    const generatedPassword = generatePassword();

    // Auto-assign role based on userType
    const role = userType === 'staff' ? 'staff' : 'user';

    const user = await User.create({
      userId,
      name,
      password: generatedPassword,
      userType,
      role,
      createdBy: req.user.userId,
    });

    const userData = user.toObject();
    delete userData.password;

    // Return user data with the generated password (only time it's shown)
    sendSuccess(
      res,
      {
        ...userData,
        generatedPassword, // Include generated password in response
      },
      'User created successfully',
      201
    );
  } catch (error) {
    sendError(res, error.message, 'SERVER_ERROR', 500);
  }
};

// Create Admin User
exports.createAdmin = async (req, res) => {
  try {
    const { userId, name, password } = req.body;

    if (!userId || !name) {
      return sendError(res, 'Please provide userId and name', 'VALIDATION_ERROR', 400);
    }

    const existingUser = await User.findOne({ userId });
    if (existingUser) {
      return sendError(res, 'User ID already exists', 'ALREADY_EXISTS', 400);
    }

    // Auto-generate password if not provided
    const adminPassword = password || generatePassword();

    const user = await User.create({
      userId,
      name,
      password: adminPassword,
      role: 'admin',
      isActive: true,
      createdBy: req.user.userId,
      // userType and name not required for admin per schema
    });

    const userData = user.toObject();
    delete userData.password;

    // Return user data with the generated password (only time it's shown if auto-generated)
    sendSuccess(
      res,
      {
        ...userData,
        generatedPassword: !password ? adminPassword : undefined, // Include password only if auto-generated
      },
      'Admin user created successfully',
      201
    );
  } catch (error) {
    sendError(res, error.message, 'SERVER_ERROR', 500);
  }
};

// Get Users
exports.getUsers = async (req, res) => {
  try {
    const { role, userType, isActive, page = 1, limit = 50 } = req.query;

    const query = {};
    if (role) query.role = role;
    if (userType) query.userType = userType;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    sendSuccess(res, {
      users,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    sendError(res, error.message, 'SERVER_ERROR', 500);
  }
};

// Update User
exports.updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive, password, name } = req.body;

    const user = await User.findOne({ userId });
    if (!user) {
      return sendError(res, 'User not found', 'NOT_FOUND', 404);
    }

    if (isActive !== undefined) {
      user.isActive = isActive;
    }

    if (name) {
      user.name = name;
    }

    if (password) {
      user.password = password; // Will be hashed by pre-save hook
    }

    await user.save();

    const userData = user.toObject();
    delete userData.password;

    sendSuccess(res, userData, 'User updated successfully');
  } catch (error) {
    sendError(res, error.message, 'SERVER_ERROR', 500);
  }
};

// Generate Tickets
exports.generateTickets = async (req, res) => {
  try {
    const { quantity } = req.body;

    if (!quantity || quantity < 1 || quantity > 10000) {
      return sendError(res, 'Quantity must be between 1 and 10000', 'VALIDATION_ERROR', 400);
    }

    const today = new Date();
    const todayStart = startOfDay(today);
    const tickets = [];

    for (let i = 0; i < quantity; i++) {
      const ticketId = `TKT-${format(today, 'yyyyMMdd')}-${String(i + 1).padStart(4, '0')}`;
      const qrCodeData = generateQRCodeData(ticketId, '', today, today);

      tickets.push({
        ticketId,
        qrCodeData,
        generatedDate: todayStart,
        generatedTime: today,
        status: 'available',
      });
    }

    await Ticket.insertMany(tickets);

    sendSuccess(res, { count: quantity }, `${quantity} tickets generated successfully`, 201);
  } catch (error) {
    sendError(res, error.message, 'SERVER_ERROR', 500);
  }
};

// Get Tickets
exports.getTickets = async (req, res) => {
  try {
    const { date, status, page = 1, limit = 100 } = req.query;

    const query = {};
    // Only filter by date if explicitly provided
    if (date) {
      const dateObj = new Date(date);
      query.generatedDate = {
        $gte: startOfDay(dateObj),
        $lte: endOfDay(dateObj),
      };
    }
    // If no date provided, show all tickets (no date filter)

    if (status) {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const tickets = await Ticket.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Ticket.countDocuments(query);

    // Calculate statistics
    const statistics = {
      available: await Ticket.countDocuments({ ...query, status: 'available' }),
      purchased: await Ticket.countDocuments({ ...query, status: 'purchased' }),
      used: await Ticket.countDocuments({ ...query, status: 'used' }),
    };

    sendSuccess(res, {
      tickets,
      total,
      statistics,
    });
  } catch (error) {
    sendError(res, error.message, 'SERVER_ERROR', 500);
  }
};

// Get Single Ticket
exports.getTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;

    const ticket = await Ticket.findOne({ ticketId });
    if (!ticket) {
      return sendError(res, 'Ticket not found', 'NOT_FOUND', 404);
    }

    sendSuccess(res, ticket);
  } catch (error) {
    sendError(res, error.message, 'SERVER_ERROR', 500);
  }
};

// Get Dashboard Stats
exports.getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    const todayStart = startOfDay(today);
    const todayEnd = endOfDay(today);

    const [
      totalTickets,
      availableTickets,
      purchasedTickets,
      usedTickets,
      totalUsers,
      scanLogsToday,
    ] = await Promise.all([
      Ticket.countDocuments({
        generatedDate: { $gte: todayStart, $lte: todayEnd },
      }),
      Ticket.countDocuments({
        generatedDate: { $gte: todayStart, $lte: todayEnd },
        status: 'available',
      }),
      Ticket.countDocuments({
        generatedDate: { $gte: todayStart, $lte: todayEnd },
        status: 'purchased',
      }),
      Ticket.countDocuments({
        generatedDate: { $gte: todayStart, $lte: todayEnd },
        status: 'used',
      }),
      User.countDocuments({ role: { $in: ['user', 'staff'] } }),
      ScanLog.countDocuments({
        scanTime: { $gte: todayStart, $lte: todayEnd },
      }),
    ]);

    sendSuccess(res, {
      totalTickets,
      availableTickets,
      purchasedTickets,
      usedTickets,
      totalUsers,
      scanLogsToday,
    });
  } catch (error) {
    sendError(res, error.message, 'SERVER_ERROR', 500);
  }
};

