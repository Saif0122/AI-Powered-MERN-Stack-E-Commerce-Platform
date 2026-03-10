import Cart from '../models/cartModel.js';
import Product from '../models/productModel.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';

// @desc    Get current user's cart
// @route   GET /api/v1/cart
// @access  Private
export const getCart = asyncHandler(async (req, res, next) => {
    let cart = await Cart.findOne({ user: req.user._id }).populate({
        path: 'items.product',
        select: 'title price description images category salePrice ratingsAverage'
    });

    if (!cart) {
        cart = await Cart.create({ user: req.user._id, items: [] });
    }

    res.status(200).json({
        status: 'success',
        data: { cart }
    });
});

// @desc    Add item to cart
// @route   POST /api/v1/cart/add
// @access  Private
export const addToCart = asyncHandler(async (req, res, next) => {
    const { productId, quantity = 1 } = req.body;

    // 1. Check if product exists and has stock
    const product = await Product.findById(productId);
    if (!product) {
        return next(new AppError('No product found with that ID', 404));
    }

    if (product.stock < quantity) {
        return next(new AppError('Insufficient stock available', 400));
    }

    // 2. Find or create cart
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
        cart = new Cart({ user: req.user._id, items: [] });
    }

    // 3. Check if product already in cart
    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);

    if (itemIndex > -1) {
        // Increment quantity
        const newQuantity = cart.items[itemIndex].quantity + quantity;
        if (product.stock < newQuantity) {
            return next(new AppError('Insufficient stock to add more of this item', 400));
        }
        cart.items[itemIndex].quantity = newQuantity;
        cart.items[itemIndex].priceAtPurchase = product.price; // Update to latest price
    } else {
        // Add new item
        cart.items.push({
            product: productId,
            quantity,
            priceAtPurchase: product.price
        });
    }

    await cart.save();

    await cart.populate({
        path: 'items.product',
        select: 'title price description images category salePrice ratingsAverage'
    });

    res.status(200).json({
        status: 'success',
        data: { cart }
    });
});

// @desc    Update cart item quantity
// @route   PUT /api/v1/cart/update
// @access  Private
export const updateQuantity = asyncHandler(async (req, res, next) => {
    const { productId, quantity } = req.body;

    if (quantity < 1) {
        return next(new AppError('Quantity must be at least 1', 400));
    }

    const product = await Product.findById(productId);
    if (!product) {
        return next(new AppError('Product not found', 404));
    }

    if (product.stock < quantity) {
        return next(new AppError('Insufficient stock available', 400));
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
        return next(new AppError('Cart not found', 404));
    }

    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
    if (itemIndex === -1) {
        return next(new AppError('Item not found in cart', 404));
    }

    cart.items[itemIndex].quantity = quantity;
    cart.items[itemIndex].priceAtPurchase = product.price; // Ensure price is current

    await cart.save();

    await cart.populate({
        path: 'items.product',
        select: 'title price description images category salePrice ratingsAverage'
    });

    res.status(200).json({
        status: 'success',
        data: { cart }
    });
});

// @desc    Remove item from cart
// @route   DELETE /api/v1/cart/remove/:productId
// @access  Private
export const removeFromCart = asyncHandler(async (req, res, next) => {
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
        return next(new AppError('Cart not found', 404));
    }

    cart.items = cart.items.filter(item => item.product.toString() !== productId);

    await cart.save();

    await cart.populate({
        path: 'items.product',
        select: 'title price description images category salePrice ratingsAverage'
    });

    res.status(200).json({
        status: 'success',
        data: { cart }
    });
});
