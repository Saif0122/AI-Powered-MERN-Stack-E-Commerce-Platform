import express from 'express';
import { createPaymentIntent, handleWebhook, getFlaggedOrders } from '../controllers/paymentController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/create-intent', protect, createPaymentIntent);
router.get('/flagged', protect, restrictTo('admin'), getFlaggedOrders);

export default router;
