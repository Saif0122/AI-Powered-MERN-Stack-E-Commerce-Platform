import mongoose from 'mongoose';

/**
 * Review Schema for MercatoX.
 * 
 * Features:
 * - References to User and Product models
 * - Rating validation (1-5)
 * - Sentiment score for AI-assisted insights
 * - Compound index to prevent duplicate reviews from the same user on one product
 */
const reviewSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: [true, 'A review must belong to a user'],
        },
        product: {
            type: mongoose.Schema.ObjectId,
            ref: 'Product',
            required: [true, 'A review must belong to a product'],
        },
        rating: {
            type: Number,
            required: [true, 'Please provide a rating between 1 and 5'],
            min: [1, 'Rating must be at least 1'],
            max: [5, 'Rating cannot exceed 5'],
        },
        comment: {
            type: String,
            required: [true, 'Please provide a comment for your review'],
            trim: true,
            minlength: [10, 'Comment must be at least 10 characters long'],
        },
        /**
         * sentimentScore: Number
         * range: -1 to 1 (negative to positive)
         */
        sentimentScore: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true, // Adds createdAt and updatedAt
    }
);

// ─── INDEXES ───────────────────────────────────────────────────────────────

// 1) Prevent a user from reviewing the same product multiple times
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

// 2) Index for fast lookups of reviews by product
reviewSchema.index({ product: 1 });

// 3) Index for fast lookups of reviews by user
reviewSchema.index({ user: 1 });

const Review = mongoose.model('Review', reviewSchema);

export default Review;
