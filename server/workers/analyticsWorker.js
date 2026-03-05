import { Worker } from 'bullmq';
import { connection } from '../config/queueConfig.js';
import Order from '../models/orderModel.js';
import redisService from '../utils/redisService.js';
import logger from '../utils/logger.js';

const analyticsWorker = connection ? new Worker('daily-analytics', async (job) => {
    logger.info('Running daily sales analytics recomputation...');

    try {
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
                    categoryBreakdown: [
                        { $unwind: '$items' },
                        {
                            $lookup: { from: 'products', localField: 'items.product', foreignField: '_id', as: 'productInfo' }
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
                            $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'categoryDetail' }
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

        const result = {
            totalRevenue: stats[0].totalStats[0]?.totalRevenue || 0,
            totalOrders: stats[0].totalStats[0]?.totalOrders || 0,
            categoryBreakdown: stats[0].categoryBreakdown
        };

        // Cache result for 24 hours
        await redisService.setCached('admin:stats:dashboard', result, 86400);

        logger.info(`Analytics recomputed: Total Sales $${result.totalRevenue}`);
    } catch (err) {
        logger.error(`Analytics Worker Error: ${err.message}`);
        throw err;
    }
}, { connection }) : null;

export default analyticsWorker;
