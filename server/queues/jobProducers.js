import { Queue } from 'bullmq';
import { connection, defaultJobOptions, redisAvailable } from '../config/queueConfig.js';
import logger from '../utils/logger.js';

// Define Queues (Only if connection is available)
export const embeddingQueue = connection ? new Queue('product-embeddings', { connection, defaultJobOptions }) : null;
export const emailQueue = connection ? new Queue('email-notifications', { connection, defaultJobOptions }) : null;
export const analyticsQueue = connection ? new Queue('daily-analytics', { connection, defaultJobOptions }) : null;

/**
 * Enqueue a job to generate embeddings for a product
 * @param {string} productId 
 */
export const enqueueEmbeddingJob = async (productId) => {
    if (!redisAvailable) return logger.warn('Redis unavailable: Skipping embedding job');
    try {
        await embeddingQueue.add('generate-embedding', { productId });
    } catch (err) {
        logger.error(`Error queuing embedding job: ${err.message}`);
    }
};

/**
 * Enqueue a job to send low stock notification email
 * @param {string} productId 
 * @param {string} vendorId 
 */
export const enqueueLowStockEmail = async (productId, vendorId) => {
    if (!redisAvailable) return logger.warn('Redis unavailable: Skipping low stock email');
    try {
        await emailQueue.add('send-low-stock-email', { productId, vendorId });
    } catch (err) {
        logger.error(`Error queuing low stock email: ${err.message}`);
    }
};

/**
 * Enqueue a job to compute daily analytics
 */
export const enqueueAnalyticsJob = async () => {
    if (!redisAvailable) return logger.warn('Redis unavailable: Skipping analytics job');
    try {
        await analyticsQueue.add('compute-sales-totals', {}, {
            repeat: { pattern: '0 0 * * *' } // Every midnight
        });
    } catch (err) {
        logger.error(`Error queuing analytics job: ${err.message}`);
    }
};

