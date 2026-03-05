import mongoose from 'mongoose';

const userActivitySchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: [true, 'Activity must belong to a user'],
        },
        type: {
            type: String,
            enum: ['search', 'view', 'purchase'],
            required: [true, 'Activity must have a type'],
        },
        text: {
            type: String,
            trim: true,
        },
        product: {
            type: mongoose.Schema.ObjectId,
            ref: 'Product',
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Index for efficient querying of recent user activities
userActivitySchema.index({ user: 1, createdAt: -1 });

const UserActivity = mongoose.model('UserActivity', userActivitySchema);

export default UserActivity;
