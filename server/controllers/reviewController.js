import Review from '../models/reviewModel.js';
import Product from '../models/productModel.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import { analyzeSentiment } from '../utils/geminiSentiment.js';
import logger from '../utils/logger.js';

/**
 * Aggregates ratings for a product.
 * Calculates average rating and total quantity of ratings.
 * @param {string} productId - The ID of the product to update.
 */
const calcAverageRatings = async function (productId) {
    const stats = await Review.aggregate([
        {
            $match: { product: productId },
        },
        {
            $group: {
                _id: '$product',
                nRating: { $sum: 1 },
                avgRating: { $avg: '$rating' },
            },
        },
    ]);

    if (stats.length > 0) {
        await Product.findByIdAndUpdate(productId, {
            ratingsQuantity: stats[0].nRating,
            ratingsAverage: stats[0].avgRating,
        });
    } else {
        await Product.findByIdAndUpdate(productId, {
            ratingsQuantity: 0,
            ratingsAverage: 4.5, // Default average
        });
    }
};

// @desc    Get all reviews
// @route   GET /api/v1/reviews
export const getAllReviews = asyncHandler(async (req, res, next) => {
    let filter = {};
    if (req.params.productId) filter = { product: req.params.productId };

    const reviews = await Review.find(filter)
        .populate('user', 'name')
        .sort('-createdAt');

    res.status(200).json({
        status: 'success',
        results: reviews.length,
        data: { reviews },
    });
});

// @desc    Create a new review
// @route   POST /api/v1/reviews
// @access  Private (User)
export const createReview = asyncHandler(async (req, res, next) => {
    // Allow nested routes
    if (!req.body.product) req.body.product = req.params.productId;
    if (!req.body.user) req.body.user = req.user.id;

    const { comment, product: productId } = req.body;

    // 1) Analyze sentiment (FAIL-SAFE)
    let sentimentScore = 0;
    try {
        if (comment) {
            logger.info(`Analyzing sentiment for review on product: ${productId}`);
            sentimentScore = await analyzeSentiment(comment);
        }
    } catch (err) {
        logger.error(`Sentiment analysis failed: ${err.message}. Saving with neutral score.`);
    }

    // 2) Create Review
    const newReview = await Review.create({
        ...req.body,
        sentimentScore,
    });

    // 3) Update Product Ratings (Async - don't block response)
    // We use a middleware pattern in Mongoose usually, but here we call it explicitly for clarity 
    // or handle it in a post-save hook in the model. 
    // Given the request for aggregation logic here:
    await calcAverageRatings(productId);

    res.status(201).json({
        status: 'success',
        data: { review: newReview },
    });
});

// @desc    Delete a review
// @route   DELETE /api/v1/reviews/:id
// @access  Private (User/Admin)
export const deleteReview = asyncHandler(async (req, res, next) => {
    const review = await Review.findByIdAndDelete(req.params.id);

    if (!review) {
        return next(new AppError('No review found with that ID', 404));
    }

    // Update product statistics
    await calcAverageRatings(review.product);

    res.status(204).json({
        status: 'success',
        data: null,
    });
});
