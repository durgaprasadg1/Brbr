const { ZodError } = require("zod");

function errorHandler(err, req, res, next) {
  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const firstIssue = err.issues[0];
    const message = firstIssue
      ? `${firstIssue.path.join(".")}: ${firstIssue.message}`
      : "Validation failed";
    return res.status(400).json({
      success: false,
      message,
      errors: err.issues,
    });
  }

  // Handle SyntaxError (e.g. malformed JSON in req.body)

  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      success: false,
      message: "Malformed JSON payload",
    });
  }

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || "Internal server error";

  if (statusCode === 500) {
    console.error("Unhandled Error:", err);
  }

  return res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" ? { stack: err.stack } : {}),
  });
}

function notFoundHandler(req, res) {
  return res.status(404).json({
    success: false,
    message: `Resource not found: ${req.method} ${req.originalUrl}`,
  });
}

module.exports = {
  errorHandler,
  notFoundHandler,
};
