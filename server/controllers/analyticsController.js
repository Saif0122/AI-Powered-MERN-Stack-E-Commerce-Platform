import mongoose from 'mongoose';
import Order from '../models/orderModel.js';
import Product from '../models/productModel.js';
import Category from '../models/categoryModel.js';
import UserActivity from '../models/userActivityModel.js';
import asyncHandler from '../utils/asyncHandler.js';
import redisService from '../utils/redisService.js';
import logger from '../utils/logger.js';

/**
 * Get global admin statistics
 */
export const getAdminStats = asyncHandler(async (req, res, next) => {
    console.log('[DEBUG] Admin analytics accessed by:', req.user);
    const cacheKey = 'admin:stats:dashboard';
    const cachedStats = await redisService.getCached(cacheKey);

    if (cachedStats) {
        return res.status(200).json({
            status: 'success',
            fromCache: true,
            data: cachedStats
        });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // 1. Sales, Revenue, Category Breakdown
    const stats = await Order.aggregate([
        {
            $facet: {
                totalStats: [
                    {
                        $group: {
                            _id: null,
                            totalRevenue: { $sum: '$totalAmount' },
                            totalOrders: { $sum: 1 }
                        }
                    }
                ],
                todayStats: [
                    { $match: { createdAt: { $gte: today } } },
                    {
                        $group: {
                            _id: null,
                            revenue: { $sum: '$totalAmount' },
                            count: { $sum: 1 }
                        }
                    }
                ],
                ordersByStatus: [
                    {
                        $group: {
                            _id: "$orderStatus",
                            count: { $sum: 1 }
                        }
                    }
                ],
                categoryBreakdown: [
                    { $unwind: '$items' },
                    {
                        $lookup: {
                            from: 'products',
                            localField: 'items.product',
                            foreignField: '_id',
                            as: 'productInfo'
                        }
                    },
                    { $unwind: '$productInfo' },
                    {
                        $group: {
                            _id: '$productInfo.category',
                            revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
                            unitsSold: { $sum: '$items.quantity' }
                        }
                    },
                    {
                        $lookup: {
                            from: 'categories',
                            localField: '_id',
                            foreignField: '_id',
                            as: 'categoryDetail'
                        }
                    },
                    { $unwind: '$categoryDetail' },
                    {
                        $project: {
                            category: '$categoryDetail.name',
                            revenue: 1,
                            unitsSold: 1
                        }
                    },
                    { $sort: { revenue: -1 } }
                ]
            }
        }
    ]);

    // 2. Conversion Rate (Visits -> Purchases)
    // We'll approximate this by (Orders / Total View Activities)
    const viewCount = await UserActivity.countDocuments({ type: 'view' });
    const orderCount = stats[0].totalStats[0]?.totalOrders || 0;
    const conversionRate = viewCount > 0 ? (orderCount / viewCount) * 100 : 0;

    const formattedStats = {
        totalRevenue: stats[0].totalStats[0]?.totalRevenue || 0,
        totalOrders: orderCount,
        todayRevenue: stats[0].todayStats[0]?.revenue || 0,
        todayOrders: stats[0].todayStats[0]?.count || 0,
        ordersByStatus: stats[0].ordersByStatus,
        categoryBreakdown: stats[0].categoryBreakdown,
        conversionRate: Math.round(conversionRate * 100) / 100
    };

    // Cache for 15 minutes (admins need relatively fresh data)
    await redisService.setCached(cacheKey, formattedStats, 900);

    res.status(200).json({
        status: 'success',
        data: formattedStats
    });
});

/**
 * GET admin/analytics/sales?range=7d
 * Get sales time-series data
 */
export const getSalesData = asyncHandler(async (req, res, next) => {
    const { range = '7d' } = req.query;
    let days = 7;
    if (range === '30d') days = 30;
    if (range === '90d') days = 90;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const salesData = await Order.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                revenue: { $sum: "$totalAmount" },
                orders: { $sum: 1 }
            }
        },
        { $sort: { "_id": 1 } }
    ]);

    res.status(200).json({
        status: 'success',
        data: salesData
    });
});

/**
 * GET admin/analytics/top-products?limit=10
 * Get most viewed products from userActivity logs
 */
export const getTopProducts = asyncHandler(async (req, res, next) => {
    const limit = parseInt(req.query.limit) || 10;

    const topProducts = await UserActivity.aggregate([
        { $match: { type: 'view', product: { $exists: true } } },
        {
            $group: {
                _id: '$product',
                viewCount: { $sum: 1 }
            }
        },
        { $sort: { viewCount: -1 } },
        { $limit: limit },
        {
            $lookup: {
                from: 'products',
                localField: '_id',
                foreignField: '_id',
                as: 'productInfo'
            }
        },
        { $unwind: '$productInfo' },
        {
            $project: {
                title: '$productInfo.title',
                price: '$productInfo.price',
                viewCount: 1
            }
        }
    ]);

    res.status(200).json({
        status: 'success',
        data: topProducts
    });
});

/**
 * Get vendor-specific statistics
 */
export const getVendorStats = asyncHandler(async (req, res, next) => {
    const vendorId = req.user.id;
    const cacheKey = `vendor:stats:${vendorId}`;
    const cachedStats = await redisService.getCached(cacheKey);

    if (cachedStats) {
        return res.status(200).json({
            status: 'success',
            fromCache: true,
            data: cachedStats
        });
    }

    const vendorObjectId = new mongoose.Types.ObjectId(vendorId);

    // 1. Find all products by vendor
    const vendorProducts = await Product.find({ vendor: vendorId }).select('_id');
    const productIds = vendorProducts.map(p => p._id);

    // 2. Aggregate orders containing these products
    const stats = await Order.aggregate([
        { $unwind: '$items' },
        { $match: { 'items.product': { $in: productIds } } },
        {
            $group: {
                _id: null,
                totalSales: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
                totalOrders: { $addToSet: '$_id' },
                unitsSold: { $sum: '$items.quantity' }
            }
        },
        {
            $project: {
                totalSales: 1,
                unitsSold: 1,
                orderCount: { $size: '$totalOrders' }
            }
        }
    ]);

    const formattedStats = stats[0] || { totalSales: 0, unitsSold: 0, orderCount: 0 };

    // Add low stock count
    const lowStockCount = await Product.countDocuments({
        vendor: vendorId,
        $expr: { $lte: ['$stock', '$lowStockThreshold'] }
    });

    formattedStats.lowStockItems = lowStockCount;

    await redisService.setCached(cacheKey, formattedStats, 300);

    res.status(200).json({
        status: 'success',
        data: formattedStats
    });
});
