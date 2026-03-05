import logger from '../utils/logger.js';
import AppError from '../utils/AppError.js';
import env from '../config/env.js';

// ── Specialised Mongoose / Mongo error handlers ────────────────────────────

const handleCastError = (err) =>
    new AppError(`Invalid ${err.path}: ${err.value}`, 400);

const handleDuplicateKeyError = (err) => {
    const field = Object.keys(err.keyValue).join(', ');
    return new AppError(`Duplicate value for field: ${field}`, 409);
};

const handleValidationError = (err) => {
    const messages = Object.values(err.errors).map((e) => e.message);
    return new AppError(`Validation failed: ${messages.join('. ')}`, 400);
};

const handleJWTError = () =>
    new AppError('Invalid token. Please log in again.', 401);

const handleJWTExpiredError = () =>
    new AppError('Your token has expired. Please log in again.', 401);

// ── Response senders ───────────────────────────────────────────────────────

const sendDevError = (res, err) => {
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        stack: err.stack,
        error: err,
    });
};

const sendProdError = (res, err) => {
    if (err.isOperational) {
        // Known, trusted error → tell the client
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
    } else {
        // Unknown / programmer error → don't leak details
        logger.error(`Unexpected error: ${err.message}\n${err.stack}`);
        res.status(500).json({
            status: 'error',
            message: 'Something went wrong. Please try again later.',
        });
    }
};

// ── Centralized error handler (must have 4 params for Express to recognise) ─

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    logger.error(`[${req.method} ${req.originalUrl}] ${err.message}`);

    if (env.isDev) {
        sendDevError(res, err);
        return;
    }

    // Production: normalise known Mongoose / Mongo errors into AppErrors
    let error = { ...err, message: err.message };

    if (err.name === 'CastError') error = handleCastError(error);
    if (err.code === 11000) error = handleDuplicateKeyError(error);
    if (err.name === 'ValidationError') error = handleValidationError(error);
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendProdError(res, error);
};

export default errorHandler;
