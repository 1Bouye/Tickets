const mongoose = require('mongoose');

const purchaseHistorySchema = new mongoose.Schema(
  {
    purchaseId: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: String,
      ref: 'User',
      required: true,
      index: true,
    },
    ticketId: {
      type: String,
      ref: 'Ticket',
      required: true,
    },
    purchaseDate: {
      type: Date,
      required: true,
      index: true,
    },
    purchaseTime: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('PurchaseHistory', purchaseHistorySchema);

