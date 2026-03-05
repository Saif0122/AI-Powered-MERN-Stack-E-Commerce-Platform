import Product from '../models/productModel.js';
import UserActivity from '../models/userActivityModel.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import { generateEmbedding } from '../utils/geminiEmbeddings.js';
import redisService from '../utils/redisService.js';
import logger from '../utils/logger.js';

// @desc    Get recommendations based on semantic query
// @route   GET /api/v1/recommendations
// @access  Public
export const getRecommendations = asyncHandler(async (req, res, next) => {
    const { query } = req.query;

    if (!query) {
        return getPopularProducts(req, res, next);
    }

    console.log(`--- AI SEARCH DEBUG: Query "${query}" ---`);

    let queryVector;
    let recommendations = [];
    let isAiSearch = false;

    // 1) Try Semantic Search
    try {
        queryVector = await generateEmbedding(query);
        isAiSearch = true;

        // Log search activity if user is authenticated
        if (req.user) {
            UserActivity.create({
                user: req.user.id,
                type: 'search',
                text: query
            }).catch(err => logger.error(`Failed to log search activity: ${err.message}`));
        }

        // Perform Vector Search Aggregation
        recommendations = await Product.aggregate([
            {
                $vectorSearch: {
                    index: 'default', // Name of the Atlas Vector Search index
                    path: 'embeddings',
                    queryVector: queryVector,
                    numCandidates: 100,
                    limit: 12,
                },
            },
            {
                $project: {
                    title: 1,
                    description: 1,
                    price: 1,
                    images: 1,
                    category: 1,
                    ratingsAverage: 1,
                    score: { $meta: 'vectorSearchScore' },
                },
            },
        ]);
        
        console.log(`AI Search successful. Found ${recommendations.length} products.`);
    } catch (err) {
        logger.error(`AI Search failed (Gemini or Vector Index): ${err.message}`);
        console.log('Falling back to traditional MongoDB Text Search...');
        
        isAiSearch = false;
        
        // 2) Fallback: Traditional MongoDB Text Search
        // This uses the 'ProductTextIndex' defined in productModel.js
        recommendations = await Product.find(
            { $text: { $search: query } },
            { score: { $meta: 'textScore' } }
        )
        .sort({ score: { $meta: 'textScore' } })
        .limit(12)
        .populate('category', 'name');

        console.log(`Fallback Search successful. Found ${recommendations.length} products.`);
    }

    res.status(200).json({
        status: 'success',
        isAiSearch, // Frontend can use this to show fallback message
        results: recommendations.length,
        data: { recommendations },
    });
});

// @desc    Get personalized recommendations for user
// @route   GET /api/v1/recommendations/personalized
// @access  Private
export const getPersonalizedRecommendations = asyncHandler(async (req, res, next) => {
    const limit = parseInt(req.query.limit) || 10;
    const cacheKey = `recs:personalized:${req.user.id}`;

    // 1) Try to get from cache
    const cachedRecs = await redisService.getCached(cacheKey);
    if (cachedRecs) {
        return res.status(200).json({
            status: 'success',
            fromCache: true,
            results: cachedRecs.length,
            data: { recommendations: cachedRecs },
        });
    }

    // 2) Get user activity
    const activities = await UserActivity.find({ user: req.user.id })
        .sort('-createdAt')
        .limit(20)
        .populate('product', 'embeddings');

    // Cold start check
    if (activities.length === 0) {
        const popularProducts = await Product.find({ stock: { $gt: 0 } })
            .sort('-ratingsAverage -ratingsQuantity')
            .limit(limit);

        return res.status(200).json({
            status: 'success',
            data: { recommendations: popularProducts },
        });
    }

    // 3) Calculate Profile Embedding (Centroid)
    const vectorSum = new Array(1536).fill(0); // Assuming 1536 dimensions for Gemini embedding-001
    let vectorCount = 0;

    for (const activity of activities) {
        let vector;
        if (activity.type === 'search') {
            vector = await generateEmbedding(activity.text);
        } else if (activity.product && activity.product.embeddings?.length > 0) {
            vector = activity.product.embeddings;
        }

        if (vector) {
            vector.forEach((val, i) => vectorSum[i] += val);
            vectorCount++;
        }
    }

    if (vectorCount === 0) {
        return res.status(200).json({
            status: 'success',
            data: { recommendations: [] },
        });
    }

    const profileVector = vectorSum.map(v => v / vectorCount);

    // 4) Vector Search
    const recommendations = await Product.aggregate([
        {
            $vectorSearch: {
                index: 'default',
                path: 'embeddings',
                queryVector: profileVector,
                numCandidates: 100,
                limit: limit + 5, // Get extra for re-ranking
            },
        },
        { $match: { stock: { $gt: 0 } } }, // Only in stock
        {
            $addFields: {
                score: { $meta: 'vectorSearchScore' }
            }
        },
        // Re-ranking logic: weight by rating and score
        {
            $project: {
                title: 1,
                description: 1,
                price: 1,
                salePrice: 1,
                images: 1,
                ratingsAverage: 1,
                stock: 1,
                finalScore: {
                    $add: [
                        { $multiply: ['$score', 10] },
                        { $multiply: ['$ratingsAverage', 0.5] }
                    ]
                }
            }
        },
        { $sort: { finalScore: -1 } },
        { $limit: limit }
    ]);

    // 5) Save to cache
    await redisService.setCached(cacheKey, recommendations, 300);

    res.status(200).json({
        status: 'success',
        results: recommendations.length,
        data: { recommendations },
    });
});

// @desc    Get popular products (global cached)
// @route   GET /api/v1/recommendations/popular
// @access  Public
export const getPopularProducts = asyncHandler(async (req, res, next) => {
    const limit = parseInt(req.query.limit) || 10;
    const cacheKey = `recs:popular:${limit}`;

    // 1) Try cache
    const cachedPopular = await redisService.getCached(cacheKey);
    if (cachedPopular) {
        return res.status(200).json({
            status: 'success',
            fromCache: true,
            results: cachedPopular.length,
            data: { recommendations: cachedPopular },
        });
    }

    // 2) Aggregation for popular products (high rating + stock)
    const popularProducts = await Product.find({ stock: { $gt: 0 } })
        .sort('-ratingsAverage -ratingsQuantity')
        .limit(limit);

    // 3) Cache for 60 seconds
    await redisService.setCached(cacheKey, popularProducts, 60);

    res.status(200).json({
        status: 'success',
        results: popularProducts.length,
        data: { recommendations: popularProducts },
    });
});
