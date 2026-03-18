function errorHandler(err, req, res, next) {
  // eslint-disable-next-line no-unused-vars
  const _next = next;
  const status = err.statusCode && Number.isInteger(err.statusCode) ? err.statusCode : 500;

  const payload = {
    error: {
      message: err.message || "Internal Server Error",
    },
  };

  if (process.env.NODE_ENV !== "production") {
    payload.error.stack = err.stack;
  }

  res.status(status).json(payload);
}

module.exports = { errorHandler };

