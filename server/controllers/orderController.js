import Order from '../models/orderModel.js';
import Cart from '../models/cartModel.js';
import Product from '../models/productModel.js';
import Address from '../models/addressModel.js';
import Coupon from '../models/couponModel.js';
import UserActivity from '../models/userActivityModel.js';
import redisService from '../utils/redisService.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import { emitLowStock, emitNewOrder } from '../config/socket.js';
import { enqueueLowStockEmail, enqueueAnalyticsJob } from '../queues/jobProducers.js';

// Helper to generate mock tracking number
const generateTrackingNumber = () => {
    return 'NXS' + Math.random().toString(36).substring(2, 11).toUpperCase();
};

// @desc    Create new order from cart
// @route   POST /api/v1/orders
// @access  Private
export const createOrder = asyncHandler(async (req, res, next) => {
    // 1. Get user's cart
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');

    if (!cart || cart.items.length === 0) {
        return next(new AppError('Your cart is empty', 400));
    }

    // 1.5 Handle Coupon
    const { couponCode } = req.body;
    let discountAmount = 0;
    let coupon = null;

    if (couponCode) {
        // Atomic find and increment usedCount if it hasn't reached the limit
        coupon = await Coupon.findOneAndUpdate(
            {
                code: couponCode.toUpperCase(),
                isActive: true,
                expiresAt: { $gt: Date.now() },
                minCartValue: { $lte: cart.totalPrice },
                $expr: { $lt: ['$usedCount', '$usageLimit'] }
            },
            { $inc: { usedCount: 1 } },
            { new: true }
        );

        if (!coupon) {
            return next(new AppError('Invalid, expired, or limit-reached coupon code', 400));
        }

        if (coupon.type === 'percentage') {
            discountAmount = (cart.totalPrice * coupon.value) / 100;
        } else {
            discountAmount = coupon.value;
        }
        discountAmount = Math.min(discountAmount, cart.totalPrice);
    }

    const finalAmount = cart.totalPrice - discountAmount;

    // 2. Get shipping address
    let shippingAddress = req.body.shippingAddress;

    // If no address provided in body, try to get user's default address
    if (!shippingAddress) {
        const defaultAddr = await Address.findOne({ user: req.user.id, isDefault: true });
        if (!defaultAddr) {
            return next(new AppError('Please provide a shipping address or set a default one', 400));
        }
        shippingAddress = {
            fullName: defaultAddr.fullName,
            phone: defaultAddr.phone,
            address: defaultAddr.address,
            city: defaultAddr.city,
            postalCode: defaultAddr.postalCode,
            country: defaultAddr.country
        };
    }

    // 3. Prepare order items and check stock
    const orderItems = [];
    for (const item of cart.items) {
        if (item.product.stock < item.quantity) {
            return next(new AppError(`${item.product.title} is out of stock`, 400));
        }

        orderItems.push({
            product: item.product._id,
            quantity: item.quantity,
            price: item.product.salePrice || item.product.price
        });

        // Update product stock atomically and prevent negative stock
        const updatedProduct = await Product.findOneAndUpdate(
            { _id: item.product._id, stock: { $gte: item.quantity } },
            { $inc: { stock: -item.quantity } },
            { new: true }
        );

        if (!updatedProduct) {
            return next(new AppError(`${item.product.title} has insufficient stock`, 400));
        }

        // Emit low stock alert if threshold reached
        if (updatedProduct.stock <= updatedProduct.lowStockThreshold) {
            await emitLowStock(updatedProduct.vendor, updatedProduct);
            // Enqueue background email
            enqueueLowStockEmail(updatedProduct._id, updatedProduct.vendor).catch(err =>
                console.error(`Failed to enqueue low stock email: ${err.message}`)
            );
        }
    }

    // 4. Create Order
    const order = await Order.create({
        user: req.user.id,
        items: orderItems,
        totalAmount: finalAmount,
        shippingAddress,
        trackingNumber: generateTrackingNumber(),
        paymentStatus: 'paid', // Mocking successful payment
        appliedCoupon: coupon ? coupon.code : undefined,
        discountAmount
    });

    // 5. Clear Cart
    cart.items = [];
    cart.totalPrice = 0;
    await cart.save();

    // 6. Log 'purchase' activity and invalidate recommendation cache
    try {
        const activities = orderItems.map(item => ({
            user: req.user.id,
            type: 'purchase',
            product: item.product
        }));
        await UserActivity.insertMany(activities);

        // Invalidate recommendation cache for this user
        await redisService.invalidate(`recs:personalized:${req.user.id}`);

        // Invalidate admin stats cache
        await redisService.invalidate('admin:stats:dashboard');

        // Emit real-time order notification
        emitNewOrder(order);

        // Enqueue background analytics recomputation
        enqueueAnalyticsJob().catch(err =>
            console.error(`Failed to enqueue analytics job: ${err.message}`)
        );
    } catch (err) {
        console.error(`Failed to log purchase activities: ${err.message}`);
    }

    res.status(201).json({
        status: 'success',
        data: {
            order
        }
    });
});

// @desc    Get logged in user orders
// @route   GET /api/v1/orders/my
// @access  Private
export const getMyOrders = asyncHandler(async (req, res, next) => {
    const orders = await Order.find({ user: req.user.id }).sort('-createdAt');

    res.status(200).json({
        status: 'success',
        results: orders.length,
        data: {
            orders
        }
    });
});

// @desc    Get single order
// @route   GET /api/v1/orders/:id
// @access  Private
export const getOrder = asyncHandler(async (req, res, next) => {
    const order = await Order.findOne({ _id: req.params.id, user: req.user.id });

    if (!order) {
        return next(new AppError('No order found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            order
        }
    });
});

// @desc    Update order status
// @route   PUT /api/v1/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = asyncHandler(async (req, res, next) => {
    const { orderStatus } = req.body;

    const order = await Order.findByIdAndUpdate(
        req.params.id,
        { orderStatus },
        { new: true, runValidators: true }
    );

    if (!order) {
        return next(new AppError('No order found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            order
        }
    });
});
