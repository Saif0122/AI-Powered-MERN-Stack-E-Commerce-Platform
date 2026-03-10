import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: [true, 'Order must belong to a user'],
        },
        items: [
            {
                product: {
                    type: mongoose.Schema.ObjectId,
                    ref: 'Product',
                    required: [true, 'Order item must have a product'],
                },
                quantity: {
                    type: Number,
                    required: [true, 'Order item must have a quantity'],
                },
                price: {
                    type: Number,
                    required: [true, 'Order item must have a price'],
                },
            },
        ],
        totalAmount: {
            type: Number,
            required: [true, 'Order must have a total amount'],
        },
        shippingAddress: {
            fullName: String,
            phone: String,
            address: String,
            city: String,
            postalCode: String,
            country: String,
        },
        paymentStatus: {
            type: String,
            enum: ['pending', 'paid'],
            default: 'pending',
        },
        orderStatus: {
            type: String,
            enum: ['processing', 'shipped', 'delivered', 'cancelled'],
            default: 'processing',
        },
        trackingNumber: {
            type: String,
            unique: true,
        },
        appliedCoupon: {
            type: String,
        },
        discountAmount: {
            type: Number,
            default: 0,
        },
        stripeSessionId: {
            type: String,
            unique: true,
            sparse: true,
        },
        isFlagged: {
            type: Boolean,
            default: false,
        },
        fraudReason: {
            type: String,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Populate product info for items
orderSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'items.product',
        select: 'title images price',
    });
    next();
});

const Order = mongoose.model('Order', orderSchema);

export default Order;
