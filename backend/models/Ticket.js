const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    qrCodeData: {
      type: String,
      required: true,
    },
    generatedDate: {
      type: Date,
      required: true,
      index: true,
    },
    generatedTime: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['available', 'purchased', 'used'],
      default: 'available',
      index: true,
    },
    purchasedBy: {
      type: String,
      ref: 'User',
      index: true,
    },
    purchasedAt: {
      type: Date,
    },
    usedAt: {
      type: Date,
    },
    scannedBy: {
      type: String,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Ticket', ticketSchema);

