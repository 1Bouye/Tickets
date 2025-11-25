const Ticket = require('../models/Ticket');
const PurchaseHistory = require('../models/PurchaseHistory');
const { v4: uuidv4 } = require('uuid');
const { startOfDay, endOfDay, format } = require('date-fns');
const { isToday } = require('../utils/date.util');
const { sendSuccess, sendError } = require('../utils/response.util');

// Get Available Ticket
exports.getAvailableTicket = async (req, res) => {
  try {
    const today = new Date();
    const todayStart = startOfDay(today);
    const todayEnd = endOfDay(today);

    // Check if user already purchased today
    const existingPurchase = await Ticket.findOne({
      purchasedBy: req.user.userId,
      generatedDate: { $gte: todayStart, $lte: todayEnd },
      status: { $in: ['purchased', 'used'] },
    });

    if (existingPurchase) {
      return sendSuccess(res, null, 'Already purchased today\'s ticket');
    }

    // Get an available ticket
    const availableTicket = await Ticket.findOne({
      generatedDate: { $gte: todayStart, $lte: todayEnd },
      status: 'available',
    });

    if (!availableTicket) {
      return sendSuccess(res, null, 'No tickets available for today');
    }

    sendSuccess(res, { ticket: availableTicket });
  } catch (error) {
    sendError(res, error.message, 'SERVER_ERROR', 500);
  }
};

// Purchase Ticket
exports.purchaseTicket = async (req, res) => {
  try {
    const today = new Date();
    const todayStart = startOfDay(today);
    const todayEnd = endOfDay(today);

    // Check if user already purchased today
    const existingPurchase = await Ticket.findOne({
      purchasedBy: req.user.userId,
      generatedDate: { $gte: todayStart, $lte: todayEnd },
      status: { $in: ['purchased', 'used'] },
    });

    if (existingPurchase) {
      return sendError(
        res,
        'You can only purchase one ticket per day',
        'TICKET_ALREADY_PURCHASED',
        400
      );
    }

    // Find available ticket
    const ticket = await Ticket.findOne({
      generatedDate: { $gte: todayStart, $lte: todayEnd },
      status: 'available',
    });

    if (!ticket) {
      return sendError(res, 'No tickets available for today', 'NOT_FOUND', 404);
    }

    // Update ticket
    ticket.status = 'purchased';
    ticket.purchasedBy = req.user.userId;
    ticket.purchasedAt = new Date();
    await ticket.save();

    // Update QR code data with user ID
    const { parseQRCodeData, generateQRCodeData } = require('../utils/qrcode.util');
    const qrData = parseQRCodeData(ticket.qrCodeData);
    ticket.qrCodeData = generateQRCodeData(
      ticket.ticketId,
      req.user.userId,
      ticket.generatedDate,
      ticket.purchasedAt
    );
    await ticket.save();

    // Create purchase history entry
    await PurchaseHistory.create({
      purchaseId: uuidv4(),
      userId: req.user.userId,
      ticketId: ticket.ticketId,
      purchaseDate: todayStart,
      purchaseTime: new Date(),
    });

    sendSuccess(res, { ticket }, 'Ticket purchased successfully');
  } catch (error) {
    sendError(res, error.message, 'SERVER_ERROR', 500);
  }
};

// Get My Ticket
exports.getMyTicket = async (req, res) => {
  try {
    const today = new Date();
    const todayStart = startOfDay(today);
    const todayEnd = endOfDay(today);

    const ticket = await Ticket.findOne({
      purchasedBy: req.user.userId,
      generatedDate: { $gte: todayStart, $lte: todayEnd },
    });

    if (!ticket) {
      return sendSuccess(res, null, 'No ticket purchased for today');
    }

    sendSuccess(res, { ticket });
  } catch (error) {
    sendError(res, error.message, 'SERVER_ERROR', 500);
  }
};

// Get Ticket History
exports.getTicketHistory = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const today = new Date();
    const todayStart = startOfDay(today);

    const tickets = await Ticket.find({
      purchasedBy: req.user.userId,
      generatedDate: { $lt: todayStart },
    })
      .sort({ generatedDate: -1 })
      .limit(parseInt(limit));

    sendSuccess(res, { tickets });
  } catch (error) {
    sendError(res, error.message, 'SERVER_ERROR', 500);
  }
};

