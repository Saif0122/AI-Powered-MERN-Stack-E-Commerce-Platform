/*
MercatoX AI E-Commerce Platform
Copyright © 2026
All Rights Reserved.

Unauthorized copying of this file or system is strictly prohibited.
*/
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

// Import routes
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import recommendationRoutes from './routes/recommendationRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import addressRoutes from './routes/addressRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import vendorRoutes from './routes/vendorRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import { initSocket } from './config/socket.js';
import exampleRoutes from './routes/exampleRoutes.js';

import healthRoute from './routes/healthRoute.js';
import recommendationsPublicRoute from './routes/recommendationsPublicRoute.js';
import faviconHandler from './middlewares/faviconHandler.js';

console.log('--- Initializing Backend ---');
console.log('Imports completed');
// Import local modules
import env from './config/env.js';
import { connectDB } from './config/db.js';
import logger from './utils/logger.js';

// Import middlewares
import requestLogger from './middleware/requestLogger.js';
import notFound from './middleware/notFound.js';
import errorHandler from './middleware/errorHandler.js';
import { protect } from './middleware/authMiddleware.js';

const app = express();

// ─── MIDDLEWARES ───────────────────────────────────────────────────────────
app.use(helmet()); // Security headers
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));   // Enable CORS with Credentials for Dev
app.use(express.json({ limit: '10kb' })); // Body parser
app.use(cookieParser());
app.use(requestLogger); // Custom request logging

// Global Copyright & Ownership Header
app.use((req, res, next) => {
    res.setHeader('X-Powered-By', 'MercatoX Proprietary System');
    res.setHeader('X-Copyright', '© 2026 MercatoX. All Rights Reserved.');
    next();
});

// ─── ROUTES ────────────────────────────────────────────────────────────────
// Favicon handler middleware
app.use(faviconHandler);

app.get('/', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Welcome to MercatoX API',
        docs: '/api/v1',
        health: '/api/v1/health'
    });
});

app.use('/api/v1/health', healthRoute);

// API v1 Root Route
app.get('/api/v1', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'MERCATOX API v1 - NexusAI Powered',
        version: '1.0.0',
        documentation: '/api/v1/docs', // Placeholder for docs
        health: '/api/v1/health'
    });
});

// Auth Routes
app.use('/api/v1/auth', authRoutes);

// Product Routes (NexusAI)
app.use('/api/v1/products', productRoutes);

// Review & Recommendation Routes
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/recommendations/public', recommendationsPublicRoute);
app.use('/api/v1/recommendations', recommendationRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/cart', cartRoutes);
app.use('/api/v1/shipping', addressRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/wishlist', wishlistRoutes);
app.use('/api/v1/coupons', couponRoutes);
app.use('/api/v1/vendor', vendorRoutes);
app.use('/api/v1/analytics', analyticsRoutes);

// Protected Example Routes
app.use('/api/v1/examples', protect, exampleRoutes);

// ─── ERROR HANDLING ────────────────────────────────────────────────────────
app.use(notFound);     // Handle 404
app.use(errorHandler); // Centralized error handling
console.log('Middlewares and Routes configured');

// ─── START SERVER ──────────────────────────────────────────────────────────
const start = async () => {
    try {
        // Connect to MongoDB Atlas
        await connectDB();

        const initialPort = Number(process.env.PORT || env.PORT) || 5000;

        const startServer = (port) => {
            if (port > 65535) {
                logger.error('Fatal error: Max port limit reached (65535). Could not execute server.');
                process.exit(1);
            }

            const server = app.listen(port)
                .on('listening', async () => {
                    logger.success(`Server running in ${env.NODE_ENV} mode on port ${port}`);
                    // Initialize Socket.io
                    await initSocket(server);
                })
                .on('error', (err) => {
                    if (err.code === 'EADDRINUSE') {
                        logger.warn(`Port ${port} is in use, trying ${port + 1}...`);
                        setTimeout(() => startServer(port + 1), 200);
                    } else {
                        logger.error(`Fatal error starting server: ${err.message}`);
                        process.exit(1);
                    }
                });
        };

        console.log(`Starting server on port ${initialPort}...`);
        startServer(initialPort);
    } catch (error) {
        logger.error(`Fatal error starting server: ${error.message}`);
        process.exit(1);
    }
};

// Handle unhandled rejections outside of express
process.on('unhandledRejection', (err) => {
    logger.error(`UNHANDLED REJECTION! 💥 ${err.name}: ${err.message}`);
    process.exit(1);
});

start();
