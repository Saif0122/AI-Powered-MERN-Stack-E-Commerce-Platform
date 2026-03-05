import Wishlist from '../models/wishlistModel.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';

// @desc    Get user wishlist
// @route   GET /api/v1/wishlist
// @access  Private
export const getWishlist = asyncHandler(async (req, res, next) => {
    let wishlist = await Wishlist.findOne({ user: req.user.id }).populate({
        path: 'items.product',
        select: 'title price images stock slug salePrice',
    });

    if (!wishlist) {
        wishlist = await Wishlist.create({ user: req.user.id, items: [] });
    }

    res.status(200).json({
        status: 'success',
        data: {
            wishlist,
        },
    });
});

// @desc    Add product to wishlist
// @route   POST /api/v1/wishlist/add
// @access  Private
export const addToWishlist = asyncHandler(async (req, res, next) => {
    const { productId } = req.body;

    if (!productId) {
        return next(new AppError('Product ID is required', 400));
    }

    let wishlist = await Wishlist.findOne({ user: req.user.id });

    if (!wishlist) {
        wishlist = await Wishlist.create({ user: req.user.id, items: [] });
    }

    // Check if product already in wishlist
    const itemExists = wishlist.items.find(
        (item) => item.product.toString() === productId
    );

    if (itemExists) {
        return next(new AppError('Product already in wishlist', 400));
    }

    wishlist.items.push({ product: productId });
    await wishlist.save();

    await wishlist.populate({
        path: 'items.product',
        select: 'title price images stock slug salePrice',
    });

    res.status(200).json({
        status: 'success',
        data: {
            wishlist,
        },
    });
});

// @desc    Remove product from wishlist
// @route   DELETE /api/v1/wishlist/remove/:productId
// @access  Private
export const removeFromWishlist = asyncHandler(async (req, res, next) => {
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ user: req.user.id });

    if (!wishlist) {
        return next(new AppError('Wishlist not found', 404));
    }

    wishlist.items = wishlist.items.filter(
        (item) => item.product.toString() !== productId
    );

    await wishlist.save();

    await wishlist.populate({
        path: 'items.product',
        select: 'title price images stock slug salePrice',
    });

    res.status(200).json({
        status: 'success',
        data: {
            wishlist,
        },
    });
});
