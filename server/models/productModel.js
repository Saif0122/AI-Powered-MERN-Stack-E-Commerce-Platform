import mongoose from 'mongoose';

/**
 * Product Schema for MercatoX.
 * 
 * Features:
 * - Vendor reference to User model
 * - Embeddings field for MongoDB Atlas Vector Search
 * - Text index for traditional keyword search
 * - Production-ready validation
 */
const productSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'A product must have a title'],
            trim: true,
            maxlength: [200, 'Title cannot exceed 200 characters'],
        },
        description: {
            type: String,
            required: [true, 'A product must have a description'],
            trim: true,
        },
        price: {
            type: Number,
            required: [true, 'A product must have a price'],
            min: [0, 'Price cannot be negative'],
        },
        vendor: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: [true, 'A product must belong to a vendor'],
        },
        category: {
            type: mongoose.Schema.ObjectId,
            ref: 'Category',
            required: [true, 'A product must have a category'],
        },
        stock: {
            type: Number,
            required: [true, 'A product must have a stock level'],
            default: 0,
            min: [0, 'Stock cannot be negative'],
        },
        /**
         * embeddings: [Number]
         * Used for MongoDB Atlas Vector Search.
         * Ensure you create a Vector Search Index in the Atlas UI to use this field.
         */
        embeddings: {
            type: [Number],
            default: [],
        },
        ratingsAverage: {
            type: Number,
            default: 4.5,
            min: [1, 'Rating must be above 1.0'],
            max: [5, 'Rating must be below 5.0'],
            set: (val) => Math.round(val * 10) / 10, // 4.666666, 46.6666, 47, 4.7
        },
        ratingsQuantity: {
            type: Number,
            default: 0,
        },
        reviewCount: {
            type: Number,
            default: 0,
        },
        images: {
            type: [String],
            default: [],
        },
        salePrice: {
            type: Number,
            min: [0, 'Sale price cannot be negative'],
        },
        lowStockThreshold: {
            type: Number,
            default: 5,
        },
        vendorNotes: {
            type: String,
        },
    },
    {
        timestamps: true, // Adds createdAt and updatedAt
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Calculate discount percentage virtual
productSchema.virtual('discountPercentage').get(function () {
    if (!this.salePrice || this.salePrice >= this.price) return 0;
    return Math.round(((this.price - this.salePrice) / this.price) * 100);
});

// ─── INDEXES ───────────────────────────────────────────────────────────────

// 1) Compound index for frequent queries
productSchema.index({ category: 1, price: 1 });

// 2) Text index for traditional keyword search
productSchema.index(
    { title: 'text', description: 'text' },
    { weights: { title: 5, description: 1 }, name: 'ProductTextIndex' }
);

/**
 * NOTE: MongoDB Atlas Vector Search Index
 * 
 * You must manually create the vector search index in the Atlas UI:
 * {
 *   "mappings": {
 *     "dynamic": false,
 *     "fields": {
 *       "embeddings": {
 *         "dimensions": 1536, // Adjust based on your embedding model (e.g. OpenAI)
 *         "similarity": "cosine",
 *         "type": "knnVector"
 *       }
 *     }
 *   }
 * }
 */

const Product = mongoose.model('Product', productSchema);

export default Product;
