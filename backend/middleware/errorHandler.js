// Central error handler: converts Mongoose errors into clean JSON responses.
function notFound(req, res) {
  res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err.name === 'ValidationError') {
    const errors = Object.fromEntries(
      Object.entries(err.errors).map(([field, e]) => [field, e.message])
    );
    return res.status(400).json({ success: false, message: 'Validation failed', errors });
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ success: false, message: `Invalid ${err.path}: ${err.value}` });
  }
  console.error(err);
  res.status(500).json({ success: false, message: 'Internal server error' });
}

module.exports = { notFound, errorHandler };
