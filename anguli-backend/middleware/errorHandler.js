// Central error handler
exports.errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Server Error';

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    statusCode = 404;
    message = 'Resource not found';
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue || {})[0];
    message = `Duplicate value for field: ${field}`;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map((val) => val.message).join(', ');
  }

  // Multer errors (file upload problems)
  if (err.name === 'MulterError') {
    statusCode = 400;
    message = err.message || 'File upload error';
  }

  // Cloudinary signature / API errors: surface a helpful message
  if (err.message && err.message.toLowerCase().includes('invalid signature')) {
    statusCode = 400;
    message = 'Cloudinary signature invalid. Check CLOUDINARY_API_SECRET and server signing logic.';
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

// 404 handler
exports.notFound = (req, res, next) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` });
};
