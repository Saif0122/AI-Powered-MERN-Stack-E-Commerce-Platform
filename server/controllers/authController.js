import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import env from '../config/env.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';

/**
 * Generate a JWT token for the user.
 * @param {string} id - User ID.
 * @returns {string} - JWT token.
 */
const signToken = (id, role) => {
    return jwt.sign({ id, role }, env.JWT_SECRET, {
        expiresIn: env.JWT_EXPIRES_IN,
    });
};

/**
 * Helper to send token response.
 * @param {Object} user - User document.
 * @param {number} statusCode - HTTP status code.
 * @param {Object} res - Express response object.
 */
const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id, user.role);

    const cookieOptions = {
        expires: new Date(
            Date.now() + env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
        secure: env.isProd, // Only send over HTTPS in production
    };

    res.cookie('jwt', token, cookieOptions);

    res.status(statusCode).json({
        success: true,
        token,
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
    });
};

// @desc    Register a new user
// @route   POST /api/v1/auth/signup
// @access  Public
export const signup = asyncHandler(async (req, res, next) => {
    const { name, email, password, accountType } = req.body;

    // Map accountType to secure internal role
    // Default to 'buyer', allow 'seller', block 'admin'
    let role = 'buyer';
    if (accountType === 'seller') {
        role = 'seller';
    }

    const newUser = await User.create({
        name,
        email,
        password,
        role,
    });

    createSendToken(newUser, 201, res);
});

// @desc    Log in an existing user
// @route   POST /api/v1/auth/login
// @access  Public
export const login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    // 1) Check if email and password exist
    if (!email || !password) {
        return next(new AppError('Please provide email and password', 400));
    }

    // 2) Check if user exists & password is correct
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password, user.password))) {
        return next(new AppError('Incorrect email or password', 401));
    }

    // 3) If everything is ok, send token to client
    createSendToken(user, 200, res);
});

// @desc    Get current user profile
// @route   GET /api/v1/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res, next) => {
    // req.user is set by protect middleware
    res.status(200).json({
        success: true,
        user: {
            _id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role,
        },
    });
});

// @desc    Get all users (Admin only)
// @route   GET /api/v1/auth/users
// @access  Private/Admin
export const getAllUsers = asyncHandler(async (req, res, next) => {
    const users = await User.find().select('-password');

    res.status(200).json({
        status: 'success',
        results: users.length,
        data: {
            users,
        },
    });
});
