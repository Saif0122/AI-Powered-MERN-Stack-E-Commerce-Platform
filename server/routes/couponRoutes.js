import express from 'express';
import {
    applyCoupon,
    createCoupon,
    getAllCoupons,
    updateCoupon,
} from '../controllers/couponController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/apply', applyCoupon);

// Admin only routes
router.use(restrictTo('admin'));
router.route('/')
    .get(getAllCoupons)
    .post(createCoupon);

router.route('/:id')
    .put(updateCoupon);

export default router;
