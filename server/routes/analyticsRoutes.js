import express from 'express';
import { getAdminStats, getVendorStats, getSalesData, getTopProducts } from '../controllers/analyticsController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/admin', restrictTo('admin'), getAdminStats);
router.get('/sales', restrictTo('admin'), getSalesData);
router.get('/top-products', restrictTo('admin'), getTopProducts);
router.get('/vendor', restrictTo('seller', 'admin'), getVendorStats);

export default router;
