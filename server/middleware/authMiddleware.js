import { promisify } from 'util';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import env from '../config/env.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';

/**
 * Middleware to protect routes — ensures the user is logged in.
 */
export const protect = asyncHandler(async (req, res, next) => {
    // 1) Getting token and check if it's there
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }

    if (!token) {
        return res.status(401).json({ success: false, message: "Not logged in" });
    }

    // 2) Verification of token
    const decoded = await promisify(jwt.verify)(token, env.JWT_SECRET);

    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
        return next(
            new AppError('The user belonging to this token no longer exists.', 401)
        );
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    next();
});

/**
 * Middleware to restrict access to specific roles.
 * @param  {...string} roles - Permitted roles (e.g., 'admin', 'vendor').
 */
export const restrictTo = (...roles) => {
    return (req, res, next) => {
        // roles ['admin', 'vendor']. role='user'
        if (!roles.includes(req.user.role)) {
            return next(
                new AppError('You do not have permission to perform this action', 403)
            );
        }

        next();
    };
};
