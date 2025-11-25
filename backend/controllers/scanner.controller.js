const Ticket = require('../models/Ticket');
const ScanLog = require('../models/ScanLog');
const User = require('../models/User');
const { v4: uuidv4 } = require('uuid');
const { startOfDay, endOfDay, isSameDay } = require('date-fns');
const { parseQRCodeData } = require('../utils/qrcode.util');
const { sendSuccess, sendError } = require('../utils/response.util');

// Validate Ticket
exports.validateTicket = async (req, res) => {
  try {
    const { qrCodeData } = req.body;

    if (!qrCodeData) {
      return sendError(res, 'QR code data is required', 'VALIDATION_ERROR', 400);
    }

    let parsedData;
    try {
      parsedData = parseQRCodeData(qrCodeData);
    } catch (error) {
      // Invalid QR code format
      await ScanLog.create({
        logId: uuidv4(),
        ticketId: 'unknown',
        scannedBy: req.user.userId,
        scanResult: 'invalid',
        userIdFromQR: 'unknown',
      });

      return sendError(res, 'Invalid ticket - not in system', 'INVALID_TICKET', 400);
    }

    // Find ticket in database
    const ticket = await Ticket.findOne({ ticketId: parsedData.ticketId });

    if (!ticket) {
      await ScanLog.create({
        logId: uuidv4(),
        ticketId: parsedData.ticketId,
        scannedBy: req.user.userId,
        scanResult: 'invalid',
        userIdFromQR: parsedData.userId,
      });

      return sendError(res, 'Invalid ticket - not in system', 'INVALID_TICKET', 400);
    }

    // Check if ticket is from today
    const today = new Date();
    if (!isSameDay(ticket.generatedDate, today)) {
      await ScanLog.create({
        logId: uuidv4(),
        ticketId: ticket.ticketId,
        scannedBy: req.user.userId,
        scanResult: 'expired',
        userIdFromQR: parsedData.userId,
      });

      return sendError(res, 'Expired ticket - from previous day', 'TICKET_EXPIRED', 400);
    }

    // Check if ticket is already used
    if (ticket.status === 'used') {
      await ScanLog.create({
        logId: uuidv4(),
        ticketId: ticket.ticketId,
        scannedBy: req.user.userId,
        scanResult: 'already_used',
        userIdFromQR: parsedData.userId,
      });

      return sendError(res, 'Ticket already used', 'TICKET_ALREADY_USED', 400);
    }

    // Check if ticket is purchased
    if (ticket.status === 'available') {
      await ScanLog.create({
        logId: uuidv4(),
        ticketId: ticket.ticketId,
        scannedBy: req.user.userId,
        scanResult: 'invalid',
        userIdFromQR: parsedData.userId,
        additionalInfo: { reason: 'Ticket not purchased' },
      });

      return sendError(res, 'Ticket not purchased', 'INVALID_TICKET', 400);
    }

    // All checks passed - mark as used
    ticket.status = 'used';
    ticket.usedAt = new Date();
    ticket.scannedBy = req.user.userId;
    await ticket.save();

    // Create success log
    await ScanLog.create({
      logId: uuidv4(),
      ticketId: ticket.ticketId,
      scannedBy: req.user.userId,
      scanResult: 'success',
      userIdFromQR: parsedData.userId,
    });

    sendSuccess(res, {
      ticket: {
        ticketId: ticket.ticketId,
        userId: ticket.purchasedBy,
        purchasedAt: ticket.purchasedAt,
      },
    }, 'Valid ticket');
  } catch (error) {
    sendError(res, error.message, 'SERVER_ERROR', 500);
  }
};

// Get Scan Logs
exports.getScanLogs = async (req, res) => {
  try {
    const { date, result, limit = 100 } = req.query;

    const query = {};
    if (date) {
      const dateObj = new Date(date);
      query.scanTime = {
        $gte: startOfDay(dateObj),
        $lte: endOfDay(dateObj),
      };
    } else {
      const today = new Date();
      query.scanTime = {
        $gte: startOfDay(today),
        $lte: endOfDay(today),
      };
    }

    if (result) {
      if (result.includes(',')) {
        query.scanResult = { $in: result.split(',') };
      } else {
        query.scanResult = result;
      }
    }

    const logs = await ScanLog.find(query)
      .sort({ scanTime: -1 })
      .limit(parseInt(limit));

    // Populate ticket and user information manually
    const enrichedLogs = await Promise.all(
      logs.map(async (log) => {
        const logObj = log.toObject();
        
        // Get ticket information if ticketId exists
        if (log.ticketId && log.ticketId !== 'unknown') {
          const ticket = await Ticket.findOne({ ticketId: log.ticketId });
          if (ticket && ticket.purchasedBy) {
            const ticketOwner = await User.findOne({ userId: ticket.purchasedBy });
            logObj.ticket = {
              ticketId: ticket.ticketId,
              owner: ticketOwner ? {
                userId: ticketOwner.userId,
                name: ticketOwner.name,
              } : null,
            };
          } else {
            logObj.ticket = {
              ticketId: log.ticketId,
              owner: null,
            };
          }
        } else {
          logObj.ticket = {
            ticketId: log.ticketId || 'unknown',
            owner: null,
          };
        }
        
        // Get scanner (staff) information
        if (log.scannedBy) {
          const scanner = await User.findOne({ userId: log.scannedBy });
          logObj.scanner = scanner ? {
            userId: scanner.userId,
            name: scanner.name,
          } : {
            userId: log.scannedBy,
            name: null,
          };
        }
        
        return logObj;
      })
    );

    const total = await ScanLog.countDocuments(query);
    const successful = await ScanLog.countDocuments({ ...query, scanResult: 'success' });
    const failed = await ScanLog.countDocuments({
      ...query,
      scanResult: { $in: ['already_used', 'invalid', 'expired'] },
    });

    sendSuccess(res, {
      logs: enrichedLogs,
      statistics: {
        total,
        successful,
        failed,
      },
    });
  } catch (error) {
    sendError(res, error.message, 'SERVER_ERROR', 500);
  }
};

// Get Current User Profile
exports.getCurrentUser = async (req, res) => {
  try {
    // req.user is already populated by auth middleware
    sendSuccess(res, {
      userId: req.user.userId,
      name: req.user.name,
      role: req.user.role,
    });
  } catch (error) {
    sendError(res, error.message, 'SERVER_ERROR', 500);
  }
};

// Get Scanner Stats
exports.getScannerStats = async (req, res) => {
  try {
    const today = new Date();
    const todayStart = startOfDay(today);
    const todayEnd = endOfDay(today);

    const total = await ScanLog.countDocuments({
      scanTime: { $gte: todayStart, $lte: todayEnd },
    });

    const successful = await ScanLog.countDocuments({
      scanTime: { $gte: todayStart, $lte: todayEnd },
      scanResult: 'success',
    });

    const alreadyUsed = await ScanLog.countDocuments({
      scanTime: { $gte: todayStart, $lte: todayEnd },
      scanResult: 'already_used',
    });

    const invalid = await ScanLog.countDocuments({
      scanTime: { $gte: todayStart, $lte: todayEnd },
      scanResult: 'invalid',
    });

    const expired = await ScanLog.countDocuments({
      scanTime: { $gte: todayStart, $lte: todayEnd },
      scanResult: 'expired',
    });

    sendSuccess(res, {
      total,
      successful,
      failed: total - successful,
      breakdown: {
        alreadyUsed,
        invalid,
        expired,
      },
    });
  } catch (error) {
    sendError(res, error.message, 'SERVER_ERROR', 500);
  }
};

