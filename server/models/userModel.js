import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * User Schema for authentication and role-based access control.
 * 
 * Includes:
 * - Production-ready validation
 * - Pre-save password hashing
 * - Password verification method
 * - Role-based permissions
 */
const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please provide your name'],
            trim: true,
            maxlength: [50, 'Name cannot exceed 50 characters'],
        },
        email: {
            type: String,
            required: [true, 'Please provide your email'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [
                /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                'Please provide a valid email address',
            ],
        },
        password: {
            type: String,
            required: [true, 'Please provide a password'],
            minlength: [8, 'Password must be at least 8 characters long'],
            select: false, // Don't return password by default in queries
        },
        role: {
            type: String,
            enum: {
                values: ['buyer', 'seller', 'admin'],
                message: 'Role must be either buyer, seller, or admin',
            },
            default: 'buyer',
        },
        isActive: {
            type: Boolean,
            default: true,
            select: false,
        },
    },
    {
        timestamps: true, // Automatically manages createdAt and updatedAt
    }
);

// ─── MIDDLEWARE: Hash password before saving ───────────────────────────────
userSchema.pre('save', async function (next) {
    // Only run this function if password was actually modified
    if (!this.isModified('password')) return next();

    // Hash the password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// ─── INSTANCE METHOD: Check if password is correct ─────────────────────────
userSchema.methods.comparePassword = async function (
    candidatePassword,
    userPassword
) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model('User', userSchema);

export default User;
