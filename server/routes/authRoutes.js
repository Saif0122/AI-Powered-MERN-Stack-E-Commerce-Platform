import { Router } from 'express';
import { signup, login, getAllUsers, getMe } from '../controllers/authController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = Router();

// POST /api/v1/auth/signup
router.post('/signup', signup);

// POST /api/v1/auth/login
router.post('/login', login);

// GET /api/v1/auth/me
router.get('/me', protect, getMe);

// Admin only routes
router.get('/users', protect, restrictTo('admin'), getAllUsers);

export default router;
