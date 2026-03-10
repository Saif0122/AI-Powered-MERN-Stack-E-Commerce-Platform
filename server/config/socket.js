import { Server } from 'socket.io';
import redisService from '../utils/redisService.js';

let io;

export const initSocket = async (server) => {
    // Redis connection is handled by redisService
    await redisService.connect();

    io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL || (env.isProd ? 'https://ai-e-commerce-eight.vercel.app' : 'http://localhost:5173'),
            methods: ['GET', 'POST'],
        },
    });

    io.on('connection', (socket) => {
        console.log('Client connected to Socket.io:', socket.id);

        // Join room based on vendor ID
        socket.on('join-vendor', (vendorId) => {
            socket.join(`vendor-${vendorId}`);
            console.log(`Socket ${socket.id} joined room vendor-${vendorId}`);
        });

        // Join admin room
        socket.on('join-admin', () => {
            socket.join('room:admin');
            console.log(`Socket ${socket.id} joined admin room`);
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized');
    }
    return io;
};

// Internal cache for in-memory debouncing (1 minute)
const debounceCache = new Map();

export const emitLowStock = async (vendorId, product) => {
    if (!io) return;

    const productId = product._id.toString();
    const now = Date.now();
    const DEBOUNCE_MS = 60 * 1000; // 1 minute

    // 1. In-memory Debouncing
    const lastEmitted = debounceCache.get(productId);
    if (lastEmitted && now - lastEmitted < DEBOUNCE_MS) {
        return;
    }

    // 2. Redis Deduplication (24-hour TTL)
    const redisKey = `alert:low-stock:${productId}`;
    const alreadyNotified = await redisService.getCached(redisKey);

    if (alreadyNotified) {
        console.log(`Deduplicated alert for product ${productId}`);
        return;
    }

    // Mark as notified for 24 hours
    await redisService.setCached(redisKey, true, 24 * 60 * 60);

    debounceCache.set(productId, now);

    const alertData = {
        productId: product._id,
        title: product.title,
        stock: product.stock,
        threshold: product.lowStockThreshold,
        vendorId,
        timestamp: new Date()
    };

    // Emit to vendor room
    io.to(`vendor-${vendorId}`).emit('low_stock_alert', alertData);

    // Emit to admin room
    io.to('room:admin').emit('low_stock_alert', alertData);

    console.log(`Low stock alert emitted for ${product.title} (Stock: ${product.stock})`);
};

export const emitNewOrder = (order) => {
    if (!io) return;

    const adminData = {
        orderId: order._id,
        totalAmount: order.totalAmount,
        user: order.user,
        timestamp: order.createdAt
    };

    // 1. Notify Admins
    io.to('room:admin').emit('new_order', adminData);

    // 2. Notify Relevant Vendors (extract vendor IDs from items)
    // For simplicity, we assume we want to notify all vendors in the order
    // In a real app, you'd probably send specific items to each vendor
    io.emit('global:new_order', { orderId: order._id }); // Fallback or general notification

    logger.info(`New order real-time notification sent for Order: ${order._id}`);
};
