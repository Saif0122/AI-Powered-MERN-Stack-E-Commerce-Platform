import logger from '../utils/logger.js';

/**
 * Logs each incoming HTTP request: method, URL, status code, and response time.
 */
const requestLogger = (req, res, next) => {
    const start = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - start;
        const statusColor =
            res.statusCode >= 500
                ? '\x1b[31m'  // Red
                : res.statusCode >= 400
                    ? '\x1b[33m'  // Yellow
                    : res.statusCode >= 300
                        ? '\x1b[36m'  // Cyan
                        : '\x1b[32m'; // Green
        const reset = '\x1b[0m';

        logger.info(
            `${req.method.padEnd(7)} ${statusColor}${res.statusCode}${reset}  ${req.originalUrl}  ${duration}ms`
        );
    });

    next();
};

export default requestLogger;
