import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: [true, 'Coupon code is required'],
            unique: true,
            uppercase: true,
            trim: true,
        },
        type: {
            type: String,
            enum: ['percentage', 'fixed'],
            required: [true, 'Coupon type is required'],
        },
        value: {
            type: Number,
            required: [true, 'Coupon value is required'],
            validate: {
                validator: function (val) {
                    if (this.type === 'percentage') {
                        return val <= 90;
                    }
                    return val > 0;
                },
                message: 'Percentage discount cannot exceed 90%',
            },
        },
        minCartValue: {
            type: Number,
            default: 0,
        },
        expiresAt: {
            type: Date,
            required: [true, 'Expiration date is required'],
        },
        usageLimit: {
            type: Number,
            required: [true, 'Usage limit is required'],
        },
        usedCount: {
            type: Number,
            default: 0,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Index for faster lookups and expiry checks
couponSchema.index({ expiresAt: 1 });

const Coupon = mongoose.model('Coupon', couponSchema);

export default Coupon;
