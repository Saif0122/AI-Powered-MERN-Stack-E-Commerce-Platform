import Stripe from 'stripe';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import Cart from '../models/cartModel.js';
import Order from '../models/orderModel.js';
import Product from '../models/productModel.js';

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
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');

    if (!cart || cart.items.length === 0) {
        return next(new AppError('Your cart is empty', 400));
    }

    const amount = Math.round(cart.totalPrice * 100);

    const paymentIntent = await getStripe().paymentIntents.create({
        amount,
        currency: 'usd',
        metadata: {
            userId: req.user.id.toString(),
            cartId: cart._id.toString()
        },
        automatic_payment_methods: {
            enabled: true,
        },
    });

    res.status(200).json({
        status: 'success',
        clientSecret: paymentIntent.client_secret,
    });
});

// @desc    Stripe Webhook Handler
// @route   POST /api/v1/payments/webhook
// @access  Public
export const handleWebhook = asyncHandler(async (req, res, next) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        event = getStripe().webhooks.constructEvent(req.rawBody, sig, webhookSecret);
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        await fulfillOrder(session);
    } else if (event.type === 'payment_intent.payment_failed') {
        const paymentIntent = event.data.object;
        console.log(`Payment failed: ${paymentIntent.last_payment_error?.message}`);
        // Optional: Update order status to failed if order was pre-created
    }

    res.status(200).json({ received: true });
});

// Helper: Fulfill Order
async function fulfillOrder(session) {
    const userId = session.metadata.userId;
    const stripeSessionId = session.id;

    // 1. Idempotency Check
    const existingOrder = await Order.findOne({ stripeSessionId });
    if (existingOrder) return;

    // 2. Fraud Checks
    let isFlagged = false;
    let fraudReason = '';

    const amountTotal = session.amount_total / 100;
    const threshold = Number(process.env.FRAUD_THRESHOLD) || 500;

    if (amountTotal > threshold) {
        isFlagged = true;
        fraudReason += `Order total $${amountTotal} exceeds threshold of $${threshold}. `;
    }

    // Country Mismatch Check (Simplified)
    const billingCountry = session.customer_details?.address?.country;
    const shippingCountry = session.shipping_details?.address?.country;
    if (billingCountry && shippingCountry && billingCountry !== shippingCountry) {
        isFlagged = true;
        fraudReason += `Country mismatch: Billing (${billingCountry}) vs Shipping (${shippingCountry}). `;
    }

    // 3. Get Cart and Create Order (Transactional logic would be better but simplified here)
    const cart = await Cart.findOne({ user: userId }).populate('items.product');
    if (!cart) return;

    const orderItems = cart.items.map(item => ({
        product: item.product._id,
        quantity: item.quantity,
        price: item.product.salePrice || item.product.price
    }));

    // Increment usage for coupons if applied (logic from orderController would need to be abstracted)
    // For now, focusing on basic fulfillment

    const order = await Order.create({
        user: userId,
        items: orderItems,
        totalAmount: amountTotal,
        shippingAddress: {
            fullName: session.shipping_details?.name,
            address: session.shipping_details?.address?.line1,
            city: session.shipping_details?.address?.city,
            postalCode: session.shipping_details?.address?.postal_code,
            country: session.shipping_details?.address?.country
        },
        paymentStatus: 'paid',
        stripeSessionId,
        isFlagged,
        fraudReason
    });

    // 4. Update Stock
    for (const item of cart.items) {
        await Product.findByIdAndUpdate(item.product._id, {
            $inc: { stock: -item.quantity }
        });
    }

    // 5. Clear Cart
    cart.items = [];
    cart.totalPrice = 0;
    await cart.save();
}

// @desc    List Flagged Orders
// @route   GET /api/v1/payments/flagged
// @access  Private/Admin
export const getFlaggedOrders = asyncHandler(async (req, res, next) => {
    const orders = await Order.find({ isFlagged: true }).populate('user', 'name email');

    res.status(200).json({
        status: 'success',
        results: orders.length,
        data: {
            orders
        }
    });
});
