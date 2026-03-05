import Stripe from 'stripe';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import Cart from '../models/cartModel.js';

// Lazily initialize Stripe so a missing key doesn't crash the server on startup
let _stripe = null;
const getStripe = () => {
    if (!_stripe) {
        const key = process.env.STRIPE_SECRET_KEY;
        if (!key || key.startsWith('sk_test_placeholder')) {
            throw new AppError('Stripe is not configured. Add your STRIPE_SECRET_KEY to the .env file.', 500);
        }
        _stripe = new Stripe(key);
    }
    return _stripe;
};

// @desc    Create Stripe Payment Intent
// @route   POST /api/v1/payments/create-intent
// @access  Private
export const createPaymentIntent = asyncHandler(async (req, res, next) => {
    // 1. Get user's cart to determine the amount
    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart || cart.items.length === 0) {
        return next(new AppError('Your cart is empty', 400));
    }

    // Stripe expects amount in cents
    const amount = Math.round(cart.totalPrice * 100);

    // 2. Create Payment Intent
    const paymentIntent = await getStripe().paymentIntents.create({
        amount,
        currency: 'usd',
        metadata: { userId: req.user.id.toString() },
        automatic_payment_methods: {
            enabled: true,
        },
    });

    res.status(200).json({
        status: 'success',
        clientSecret: paymentIntent.client_secret,
    });
});
