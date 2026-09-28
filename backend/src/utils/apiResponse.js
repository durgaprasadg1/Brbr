function sendSuccess(res, statusCode = 200, message = "Success", data = {}) {
  return res.status(statusCode).json({
    success: true,
    message,
    ...data,
  });
}

function sendError(res, statusCode = 400, message = "An error occurred", error = null) {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(error ? { error } : {}),
  });
}

module.exports = {
  sendSuccess,
  sendError,
};
