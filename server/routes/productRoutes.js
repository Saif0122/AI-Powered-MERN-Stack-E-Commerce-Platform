import { Router } from 'express';
import {
    getAllProducts,
    getProduct,
    getProductBySlug,
    getProductsByCategory,
    createProduct,
    updateProduct,
    deleteProduct,
} from '../controllers/productController.js';
import reviewRouter from './reviewRoutes.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = Router();

// Nested route
router.use('/:productId/reviews', reviewRouter);

// Publicly available routes
router.route('/').get(getAllProducts);
router.route('/category/:categoryId').get(getProductsByCategory);
router.route('/slug/:slug').get(getProductBySlug);  // New SEO-friendly slug route
router.route('/:id').get(getProduct);

// Protected and restricted routes (Only sellers and admins for viewing/updating, but only sellers for creating)
router.use(protect);

router.route('/').post(restrictTo('seller'), createProduct);
router.route('/:id').patch(restrictTo('admin', 'seller'), updateProduct).delete(restrictTo('admin', 'seller'), deleteProduct);

export default router;
