const { format } = require('date-fns');

/**
 * Generate QR code data string
 * Format: ticketId|userId|date|time
 */
exports.generateQRCodeData = (ticketId, userId, date, time) => {
  const dateStr = format(date, 'yyyy-MM-dd');
  const timeStr = format(time, 'HH:mm:ss');
  return `${ticketId}|${userId}|${dateStr}|${timeStr}`;
};

/**
 * Parse QR code data string
 */
exports.parseQRCodeData = (qrCodeData) => {
  const parts = qrCodeData.split('|');
  if (parts.length !== 4) {
    throw new Error('Invalid QR code format');
  }
  return {
    ticketId: parts[0],
    userId: parts[1],
    date: parts[2],
    time: parts[3],
  };
};

