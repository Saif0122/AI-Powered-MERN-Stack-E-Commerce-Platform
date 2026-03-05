import express from 'express';
import {
    createOrder,
    getMyOrders,
    getOrder,
    updateOrderStatus
} from '../controllers/orderController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
    .post(createOrder);

router.get('/my', getMyOrders);

router.route('/:id')
    .get(getOrder);

// Admin only
router.patch('/:id/status', restrictTo('admin'), updateOrderStatus);

export default router;
