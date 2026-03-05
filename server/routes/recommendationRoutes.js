import { Router } from 'express';
import { getRecommendations, getPersonalizedRecommendations, getPopularProducts } from '../controllers/recommendationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

// GET /api/v1/recommendations?query=...
router.get('/', getRecommendations);

// GET /api/v1/recommendations/popular or /api/v1/recommendations/public
router.get('/popular', getPopularProducts);
router.get('/public', getPopularProducts);

// GET /api/v1/recommendations/personalized
router.get('/personalized', protect, getPersonalizedRecommendations);

export default router;
