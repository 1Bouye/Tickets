/**
 * Send success response
 */
exports.sendSuccess = (res, data, message = null, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data,
    message,
  });
};

/**
 * Send error response
 */
exports.sendError = (res, message, code = 'ERROR', statusCode = 400) => {
  return res.status(statusCode).json({
    success: false,
    error: {
      message,
      code,
    },
  });
};

