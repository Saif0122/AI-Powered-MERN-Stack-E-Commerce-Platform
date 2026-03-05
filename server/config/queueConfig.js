import { Queue, Worker, QueueEvents } from 'bullmq';
import IORedis from 'ioredis';
import logger from '../utils/logger.js';

const redisUrl = process.env.REDIS_URL;
let redisAvailable = !!redisUrl; // Assume available if passed, until error happens
let connection = null;

if (redisUrl) {
    connection = new IORedis(redisUrl, {
        maxRetriesPerRequest: null, // Required by BullMQ
        lazyConnect: true,          // Don't connect immediately
        enableOfflineQueue: false,  // Don't queue commands when offline
        retryStrategy(times) {
            if (times > 3) return null; // Stop retrying after 3 attempts — prevents hanging process
            return Math.min(times * 1000, 3000);
        },
    });

    connection.on('connect', () => {
        redisAvailable = true;
    });

    connection.on('error', (err) => {
        if (redisAvailable) {
            logger.error(`BullMQ Redis Connection Error: ${err.message}`);
        } else {
            logger.warn('Redis unavailable - running without queue & caching');
        }
        redisAvailable = false;
    });
} else {
    logger.warn('Redis unavailable - running without queue & caching (No REDIS_URL provided)');
}

export const defaultJobOptions = {
    attempts: 3,
    backoff: {
        type: 'exponential',
        delay: 5000,
    },
    removeOnComplete: true,
    removeOnFail: false,
};

export { connection, redisAvailable };

