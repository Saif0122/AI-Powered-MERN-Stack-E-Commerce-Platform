import { Router } from 'express';
import { signup, login, getAllUsers } from '../controllers/authController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = Router();

// POST /api/v1/auth/signup
router.post('/signup', signup);

// POST /api/v1/auth/login
router.post('/login', login);

// Admin only routes
router.get('/users', protect, restrictTo('admin'), getAllUsers);

export default router;
