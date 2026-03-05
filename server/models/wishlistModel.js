import mongoose from 'mongoose';

const wishlistSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: [true, 'Wishlist must belong to a user'],
            unique: true,
        },
        items: [
            {
                product: {
                    type: mongoose.Schema.ObjectId,
                    ref: 'Product',
                    required: [true, 'Wishlist item must have a product'],
                },
                addedAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
    },
    {
        timestamps: true,
    }
);

const Wishlist = mongoose.model('Wishlist', wishlistSchema);

export default Wishlist;
