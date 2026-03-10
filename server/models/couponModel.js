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
                        return val > 0 && val <= 90;
                    }
                    return val > 0;
                },
                message: 'Value must be positive and percentage cannot exceed 90%',
            },
        },
        minCartValue: {
            type: Number,
            default: 0,
        },
        expiresAt: {
            type: Date,
        },
        usageLimit: {
            type: Number,
            default: 100,
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
