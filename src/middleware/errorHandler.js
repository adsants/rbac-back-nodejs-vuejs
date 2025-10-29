import logger from '../config/logger.js';

export function notFound(_req, res, _next) {
  res.status(404).json({ message: 'Route not found' });
}

export function errorHandler(err, _req, res, _next) {
  logger.error(err.message, { stack: err.stack });
  const status = err.status || 500;
  res.status(status).json({ message: err.message || 'Internal Server Error' });
}
