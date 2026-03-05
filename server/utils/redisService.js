import IORedis from 'ioredis';
import logger from './logger.js';

class RedisService {
    constructor() {
        this.client = null;
        this.isConnected = false;

        const redisUrl = process.env.REDIS_URL;

        if (!redisUrl) {
            logger.warn('Redis unavailable - running without caching (No REDIS_URL provided)');
            return;
        }

        try {
            this.client = new IORedis(redisUrl, {
                maxRetriesPerRequest: null, // Required by BullMQ
                lazyConnect: true,          // Don't connect immediately
                enableOfflineQueue: false, // Don't queue commands if offline
                retryStrategy(times) {
                    if (times > 3) {
                        logger.warn('Redis reconnection failed after 3 attempts. Giving up.');
                        return null;
                    }
                    const delay = Math.min(times * 2000, 5000);
                    logger.info(`Retrying Redis connection in ${delay}ms (Attempt ${times})...`);
                    return delay;
                }
            });

            // Handle connection drops and reconnects
            this.client.on('error', (err) => {
                logger.error(`ERROR Redis client: ${err.message}`);
                this.isConnected = false;
            });

            this.client.on('connect', () => {
                logger.success('Redis Client Connected');
                this.isConnected = true;
            });

            this.client.on('reconnecting', () => {
                logger.warn('Redis client reconnecting...');
                this.isConnected = false;
            });

            this.client.on('close', () => {
                if (this.isConnected) {
                    logger.warn('Redis connection closed.');
                    this.isConnected = false;
                }
            });

            this.client.on('end', () => {
                logger.warn('Redis connection ended completely (no more retries).');
                this.isConnected = false;
            });
        } catch (err) {
            logger.error(`Redis init failed: ${err.message}`);
        }
    }

    async connect() {
        if (!this.client || this.isConnected) return;
        try {
            await this.client.connect();
            this.isConnected = true;
        } catch (err) {
            logger.warn(`Could not connect to Redis: ${err.message}. Running without caching.`);
            this.isConnected = false;
        }
    }

    /**
     * Get cached value
     */
    async getCached(key) {
        if (!this.isConnected || !this.client) return null;
        try {
            const data = await this.client.get(key);
            return data ? JSON.parse(data) : null;
        } catch (err) {
            logger.error(`Redis Get Error [${key}]: ${err.message}`);
            return null; // Resolve safely on error
        }
    }

    /**
     * Set cached value with TTL
     */
    async setCached(key, value, ttl = 300) {
        if (!this.isConnected || !this.client) return;
        try {
            await this.client.set(key, JSON.stringify(value), { EX: ttl });
        } catch (err) { } // Resolve safely natively
    }

    /**
     * Invalidate cache key
     */
    async invalidate(key) {
        if (!this.isConnected || !this.client) return;
        try {
            await this.client.del(key);
        } catch (err) { }
    }
}

const redisService = new RedisService();
export default redisService;
