import express from 'express';
import {
    getVendorProducts,
    updateInventory,
    bulkUpdateStock,
    getVendorOrders,
    updateOrderStatus
} from '../controllers/vendorController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

// Seller only routes
router.use(protect);
router.use(restrictTo('seller', 'admin'));

router.get('/products', getVendorProducts);
router.put('/products/:id', updateInventory);
router.post('/products/bulk-stock', bulkUpdateStock);

// Order Fulfillment
router.get('/orders', getVendorOrders);
router.put('/orders/:id', updateOrderStatus);

export default router;
