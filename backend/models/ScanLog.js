const mongoose = require('mongoose');

const scanLogSchema = new mongoose.Schema(
  {
    logId: {
      type: String,
      required: true,
      unique: true,
    },
    ticketId: {
      type: String,
      ref: 'Ticket',
      index: true,
    },
    scannedBy: {
      type: String,
      ref: 'User',
      required: true,
      index: true,
    },
    scanTime: {
      type: Date,
      default: Date.now,
      index: true,
    },
    scanResult: {
      type: String,
      enum: ['success', 'already_used', 'invalid', 'expired'],
      required: true,
    },
    userIdFromQR: {
      type: String,
    },
    additionalInfo: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ScanLog', scanLogSchema);

