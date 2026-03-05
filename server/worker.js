import './config/db.js'; // Ensure DB connection
import './workers/embeddingWorker.js';
import './workers/emailWorker.js';
import './workers/analyticsWorker.js';
import logger from './utils/logger.js';

logger.info('🚀 Background workers process started successfully.');

// Handle process termination gracefully
process.on('SIGTERM', () => {
    logger.info('SIGTERM received. Shutting down workers...');
    process.exit(0);
});
