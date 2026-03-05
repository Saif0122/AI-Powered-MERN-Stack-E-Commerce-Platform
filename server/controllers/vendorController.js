import Product from '../models/productModel.js';
import Order from '../models/orderModel.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';

// @desc    Get all products for the authenticated vendor
// @route   GET /api/v1/vendor/products
// @access  Private/Vendor
export const getVendorProducts = asyncHandler(async (req, res, next) => {
    const products = await Product.find({ vendor: req.user.id }).sort('-createdAt');

    res.status(200).json({
        status: 'success',
        results: products.length,
        data: {
            products,
        },
    });
});

// @desc    Update product inventory (stock, price, threshold)
// @route   PUT /api/v1/vendor/products/:id
// @access  Private/Vendor
export const updateInventory = asyncHandler(async (req, res, next) => {
    const { stock, price, salePrice, lowStockThreshold, vendorNotes } = req.body;

    const product = await Product.findOne({ _id: req.params.id, vendor: req.user.id });

    if (!product) {
        return next(new AppError('No product found with that ID belonging to you', 404));
    }

    if (stock !== undefined) product.stock = stock;
    if (price !== undefined) product.price = price;
    if (salePrice !== undefined) product.salePrice = salePrice;
    if (lowStockThreshold !== undefined) product.lowStockThreshold = lowStockThreshold;
    if (vendorNotes !== undefined) product.vendorNotes = vendorNotes;

    await product.save();

    res.status(200).json({
        status: 'success',
        data: {
            product,
        },
    });
});

// @desc    Bulk update stock levels
// @route   POST /api/v1/vendor/products/bulk-stock
// @access  Private/Vendor
export const bulkUpdateStock = asyncHandler(async (req, res, next) => {
    const { updates } = req.body; // Array of { productId, stock }

    if (!updates || !Array.isArray(updates)) {
        return next(new AppError('Please provide an array of updates', 400));
    }

    const bulkOps = updates.map((update) => ({
        updateOne: {
            filter: { _id: update.productId, vendor: req.user.id },
            update: { $set: { stock: update.stock } },
        },
    }));

    await Product.bulkWrite(bulkOps);

    res.status(200).json({
        status: 'success',
        message: 'Bulk stock update successful',
    });
});

// @desc    Get orders for the vendor
// @route   GET /api/v1/vendor/orders
// @access  Private/Vendor
export const getVendorOrders = asyncHandler(async (req, res, next) => {
    // 1) Find all products by vendor
    const vendorProducts = await Product.find({ vendor: req.user.id }).select('_id');
    const productIds = vendorProducts.map(p => p._id);

    // 2) Find orders containing these products
    const orders = await Order.find({
        'items.product': { $in: productIds }
    }).sort('-createdAt').populate('items.product', 'title price images');

    res.status(200).json({
        status: 'success',
        results: orders.length,
        data: {
            orders,
        },
    });
});

// @desc    Update order fulfillment status
// @route   PUT /api/v1/vendor/orders/:id
// @access  Private/Vendor
export const updateOrderStatus = asyncHandler(async (req, res, next) => {
    const { orderStatus, trackingNumber } = req.body;

    // Check if the order contains vendor's products
    const vendorProducts = await Product.find({ vendor: req.user.id }).select('_id');
    const productIds = vendorProducts.map(p => p._id);

    const order = await Order.findOne({
        _id: req.params.id,
        'items.product': { $in: productIds }
    });

    if (!order) {
        return next(new AppError('Order not found or access denied', 404));
    }

    if (orderStatus) order.orderStatus = orderStatus;
    if (trackingNumber) order.trackingNumber = trackingNumber;

    await order.save();

    res.status(200).json({
        status: 'success',
        data: {
            order,
        },
    });
});
