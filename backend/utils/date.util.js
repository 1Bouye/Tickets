const { format, isSameDay, startOfDay } = require('date-fns');

/**
 * Check if a date is today
 */
exports.isToday = (date) => {
  return isSameDay(new Date(date), new Date());
};

/**
 * Get start of today
 */
exports.getTodayStart = () => {
  return startOfDay(new Date());
};

/**
 * Format date for display
 */
exports.formatDate = (date, formatStr = 'yyyy-MM-dd') => {
  return format(new Date(date), formatStr);
};

