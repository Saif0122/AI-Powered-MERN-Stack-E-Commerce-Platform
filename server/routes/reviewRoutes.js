import { Router } from 'express';
import {
    getAllReviews,
    createReview,
    deleteReview,
} from '../controllers/reviewController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

// mergeParams: true allows us to access productId from parent router
const router = Router({ mergeParams: true });

// Publicly available
router.get('/', getAllReviews);

// Protected routes
router.use(protect);

router.post('/', restrictTo('user'), createReview);
router.delete('/:id', restrictTo('user', 'admin'), deleteReview);

export default router;
