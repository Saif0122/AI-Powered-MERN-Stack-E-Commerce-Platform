import mongoose from 'mongoose';
import env from './env.js';
import logger from '../utils/logger.js';

/**
 * MongoDB Atlas Connection Configuration with Mongoose.
 * 
 * Includes:
 * - Exponential back-off retry logic
 * - Modern async/await
 * - Detailed logging for success/failure/retries
 * - Graceful connection management
 */
const MAX_RETRIES = 5;
const RETRY_INTERVAL_MS = 5000;

const connectDB = async (attempt = 1) => {
    try {
        // Atlas-friendly connection options
        const options = {
            serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
            socketTimeoutMS: 45000,       // Close sockets after 45s of inactivity
            autoIndex: env.isDev,         // Only build indexes in development
        };

        const conn = await mongoose.connect(env.MONGO_URI, options);
        logger.success(`MongoDB Connected: ${conn.connection.host} (Attempt ${attempt})`);
        return true;
    } catch (error) {
        logger.error(`MongoDB Connection Error (Attempt ${attempt}/${MAX_RETRIES}): ${error.message}`);

        if (attempt < MAX_RETRIES) {
            const delay = RETRY_INTERVAL_MS * attempt;
            logger.warn(`Retrying connection in ${delay / 1000}s...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return connectDB(attempt + 1);
        } else {
            logger.error('❌ Max MongoDB connection retries reached. Server continuing WITHOUT database connection.');
            // We resolve false rather than process.exit(1) for safe startup mode
            return false;
        }
    }
};

// Listen for Mongoose events
mongoose.connection.on('disconnected', () => {
    logger.warn('Mongoose connection disconnected.');
});

mongoose.connection.on('error', (err) => {
    logger.error(`Mongoose connection error: ${err.message}`);
});

export { connectDB };
