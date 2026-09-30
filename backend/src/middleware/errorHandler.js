export const errorHandler = (err, req, res, next) => {
  console.error('[Error Details]:', err);

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'An unexpected internal server error occurred.';

  res.status(statusCode).json({
    success: false,
    message,
    errors: err.errors || (process.env.NODE_ENV === 'development' ? [err.stack] : []),
    timestamp: new Date().toISOString()
  });
};
