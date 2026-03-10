import Coupon from '../models/couponModel.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';

// @desc    Apply coupon to cart
// @route   POST /api/v1/coupons/apply
// @access  Private
export const applyCoupon = asyncHandler(async (req, res, next) => {
    const { code, cartTotal } = req.body;

    if (!code || cartTotal === undefined) {
        return next(new AppError('Please provide coupon code and cart total', 400));
    }

    const coupon = await Coupon.findOne({
        code: code.toUpperCase(),
        isActive: true,
        expiresAt: { $gt: Date.now() },
    });

    if (!coupon) {
        return next(new AppError('Invalid or expired coupon code', 400));
    }

    if (cartTotal < coupon.minCartValue) {
        return next(
            new AppError(
                `Minimum cart value of $${coupon.minCartValue} required for this coupon`,
                400
            )
        );
    }

    if (coupon.usedCount >= coupon.usageLimit) {
        return next(new AppError('Coupon usage limit reached', 400));
    }

    let discountAmount = 0;
    if (coupon.type === 'percentage') {
        discountAmount = (cartTotal * coupon.value) / 100;
    } else {
        discountAmount = coupon.value;
    }

    // Ensure discount doesn't exceed total
    discountAmount = Math.min(discountAmount, cartTotal);
    const newTotal = cartTotal - discountAmount;

    res.status(200).json({
        status: 'success',
        data: {
            code: coupon.code,
            discountAmount,
            newTotal,
            type: coupon.type,
            value: coupon.value,
        },
    });
});

// @desc    Admin: Create coupon
// @route   POST /api/v1/coupons
// @access  Private/Admin
export const createCoupon = asyncHandler(async (req, res, next) => {
    try {
        const { code, type, value, expiresAt, usageLimit, minCartValue } = req.body;

        if (!code) return next(new AppError('Coupon code is required', 400));
        if (!type) return next(new AppError('Coupon type is required', 400));
        if (value === undefined || value <= 0) return next(new AppError('A positive discount value is required', 400));

        const coupon = await Coupon.create({
            code: code.toUpperCase(),
            type,
            value,
            expiresAt,
            usageLimit: usageLimit || 100,
            minCartValue: minCartValue || 0
        });

        res.status(201).json({
            status: 'success',
            data: {
                coupon,
            },
        });
    } catch (error) {
        if (error.code === 11000) {
            return next(new AppError('Coupon code already exists', 400));
        }
        next(error);
    }
});

// @desc    Admin: Get all coupons
// @route   GET /api/v1/coupons
// @access  Private/Admin
export const getAllCoupons = asyncHandler(async (req, res, next) => {
    const coupons = await Coupon.find().sort('-createdAt');

    res.status(200).json({
        status: 'success',
        results: coupons.length,
        data: {
            coupons,
        },
    });
});

// @desc    Admin: Update coupon
// @route   PUT /api/v1/coupons/:id
// @access  Private/Admin
export const updateCoupon = asyncHandler(async (req, res, next) => {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    if (!coupon) {
        return next(new AppError('No coupon found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            coupon,
        },
    });
});

// Note: Atomic increment should happen during ORDER CREATION, not during APPLY validation.
// This controller handles validation for UI/Checkout.
// The Order creation logic will handle findOneAndUpdate with $inc and conditional match.
