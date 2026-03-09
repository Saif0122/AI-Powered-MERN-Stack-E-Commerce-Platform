import mongoose from 'mongoose';
import Product from '../models/productModel.js';
import Category from '../models/categoryModel.js';
import UserActivity from '../models/userActivityModel.js';
import redisService from '../utils/redisService.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import { generateEmbedding } from '../utils/geminiEmbeddings.js';
import { enqueueEmbeddingJob } from '../queues/jobProducers.js';
import logger from '../utils/logger.js';

// @desc    Get products by category
// @route   GET /api/v1/products/category/:categoryId
// @access  Public
export const getProductsByCategory = asyncHandler(async (req, res, next) => {
    const { categoryId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
        return next(new AppError('Invalid category ID', 400));
    }

    const products = await Product.find({ category: categoryId })
        .populate('vendor', 'name email')
        .populate('category', 'name slug');

    res.status(200).json({
        status: 'success',
        results: products.length,
        data: { products },
    });
});

// @desc    Get all products
// @route   GET /api/v1/products
// @access  Public
export const getAllProducts = asyncHandler(async (req, res, next) => {
    const products = await Product.find().populate('vendor', 'name email').populate('category', 'name slug');
    res.status(200).json({
        status: 'success',
        results: products.length,
        data: { products },
    });
});

// @desc    Get a single product
// @route   GET /api/v1/products/:id
// @access  Public
export const getProduct = asyncHandler(async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return next(new AppError('Invalid product ID', 400));
    }

    const product = await Product.findById(req.params.id)
        .populate('vendor', 'name email')
        .populate('category', 'name slug');

    if (!product) {
        return next(new AppError('Product not found', 404));
    }

    // Log 'view' activity if user is authenticated
    if (req.user) {
        UserActivity.create({
            user: req.user.id,
            type: 'view',
            product: product._id
        }).catch(err => logger.error(`Failed to log view activity: ${err.message}`));
    }

    res.status(200).json({
        status: 'success',
        data: { product },
    });
});

// @desc    Get a single product by Slug (with ID fallback)
// @route   GET /api/v1/products/slug/:slug
// @access  Public
export const getProductBySlug = asyncHandler(async (req, res, next) => {
    let product;
    const { slug } = req.params;

    // First attempt: match by slug
    product = await Product.findOne({ slug })
        .populate('vendor', 'name email')
        .populate('category', 'name slug');

    // Second attempt: Fallback to matching by ID if no slug was found (for older database records)
    if (!product && mongoose.Types.ObjectId.isValid(slug)) {
        product = await Product.findById(slug)
            .populate('vendor', 'name email')
            .populate('category', 'name slug');
    }

    if (!product) {
        return next(new AppError('Product not found', 404));
    }

    // Log 'view' activity if user is authenticated
    if (req.user) {
        UserActivity.create({
            user: req.user.id,
            type: 'view',
            product: product._id
        }).catch(err => logger.error(`Failed to log view activity: ${err.message}`));
    }

    res.status(200).json({
        status: 'success',
        data: { product },
    });
});

// @desc    Create a new product
// @route   POST /api/v1/products
// @access  Private (Vendor/Admin)
export const createProduct = asyncHandler(async (req, res, next) => {
    // Debug logging
    console.log('--- CREATE PRODUCT DEBUG ---');
    console.log('User Role:', req.user?.role);
    console.log('User ID:', req.user?._id);
    console.log('Request Body:', JSON.stringify(req.body, null, 2));

    const { title, description, price, stock, category } = req.body;

    // 1) Explicit Validation
    if (!title) {
        return next(new AppError('Product must have a title', 400));
    }
    if (price === undefined || price <= 0) {
        return next(new AppError('Product must have a price greater than 0', 400));
    }
    if (stock === undefined || stock < 0) {
        return next(new AppError('Product must have a stock level of 0 or more', 400));
    }

    // 2) Verify category exists
    if (category) {
        console.log("Received category ID:", category);

        // Validate ID format
        if (!mongoose.Types.ObjectId.isValid(category)) {
            return next(new AppError('Invalid category ID format', 400));
        }

        const categoryExists = await Category.findById(category);
        if (!categoryExists) {
            return next(new AppError('Category does not exist', 404));
        }
    }

    // 3) Add vendor ID from the authenticated user
    const productData = {
        ...req.body,
        vendor: req.user._id,
    };

    // Generate embedding from description (FAIL-SAFE)
    try {
        if (description) {
            logger.info(`Generating embedding for product: ${title}`);
            productData.embeddings = await generateEmbedding(description);
        }
    } catch (err) {
        logger.error(`Embedding generation failed for product "${title}": ${err.message}. Saving without embeddings.`);
        // We continue so the product is still created even if AI service is down
    }

    const newProduct = await Product.create(productData);

    // Enqueue background embedding generation
    if (!productData.embeddings || productData.embeddings.length === 0) {
        enqueueEmbeddingJob(newProduct._id).catch(err =>
            logger.error(`Failed to enqueue embedding job for ${newProduct._id}: ${err.message}`)
        );
    }

    // Invalidate popular recommendations cache
    await redisService.invalidate('recs:popular');

    res.status(201).json({
        status: 'success',
        data: { product: newProduct },
    });
});

// @desc    Update a product
// @route   PATCH /api/v1/products/:id
// @access  Private (Vendor/Admin)
export const updateProduct = asyncHandler(async (req, res, next) => {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    if (!product) {
        return next(new AppError('No product found with that ID', 404));
    }

    // Invalidate popular recommendations cache
    await redisService.invalidate('recs:popular');

    res.status(200).json({
        status: 'success',
        data: { product },
    });
});

// @desc    Delete a product
// @route   DELETE /api/v1/products/:id
// @access  Private (Vendor/Admin)
export const deleteProduct = asyncHandler(async (req, res, next) => {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
        return next(new AppError('No product found with that ID', 404));
    }

    // Invalidate popular recommendations cache
    await redisService.invalidate('recs:popular');

    res.status(204).json({
        status: 'success',
        data: null,
    });
});
