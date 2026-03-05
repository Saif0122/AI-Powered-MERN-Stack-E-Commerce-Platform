import AppError from '../utils/AppError.js';

/**
 * Catch-all for routes that do not exist.
 * Must be mounted AFTER all other routes.
 */
const notFound = (req, res, next) => {
    next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
};

export default notFound;
