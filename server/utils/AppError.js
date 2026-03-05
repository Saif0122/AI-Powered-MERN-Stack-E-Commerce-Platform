/**
 * Custom operational error class.
 * Distinguishes known, expected errors (e.g. 404, 400) from programmer errors.
 */
class AppError extends Error {
    /**
     * @param {string} message  - Human-readable error message.
     * @param {number} statusCode - HTTP status code to send to the client.
     */
    constructor(message, statusCode) {
        super(message);

        this.statusCode = statusCode;
        this.status = String(statusCode).startsWith('4') ? 'fail' : 'error';
        this.isOperational = true; // flag used by the error handler

        // Capture stack trace, excluding this constructor
        Error.captureStackTrace(this, this.constructor);
    }
}

export default AppError;
