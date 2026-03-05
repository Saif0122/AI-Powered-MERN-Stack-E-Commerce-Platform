import mongoose from 'mongoose';

/**
 * Example Mongoose model — replace/extend with your own schemas.
 *
 * Demonstrates:
 *  - Field-level validation
 *  - Default values
 *  - Automatic timestamps
 *  - Instance method
 *  - Static method
 */
const exampleSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
            maxlength: [100, 'Name must be at most 100 characters'],
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/\S+@\S+\.\S+/, 'Please provide a valid email address'],
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true, // adds createdAt & updatedAt
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// ── Instance method ──────────────────────────────────────────────────────
exampleSchema.methods.toSafeObject = function () {
    const obj = this.toObject();
    return obj;
};

// ── Static method ────────────────────────────────────────────────────────
exampleSchema.statics.findActive = function () {
    return this.find({ isActive: true });
};

// ── Index ────────────────────────────────────────────────────────────────
// email already has unique: true which creates an index

const Example = mongoose.model('Example', exampleSchema);

export default Example;
