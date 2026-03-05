import mongoose from 'mongoose';
import slugify from 'slugify';

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'A category must have a name'],
            unique: true,
            trim: true,
            maxlength: [50, 'A category name must have less or equal then 50 characters'],
        },
        slug: {
            type: String,
            unique: true,
        },
        description: {
            type: String,
            required: [true, 'A category must have a description'],
        }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// Generate slug before saving
categorySchema.pre('save', function (next) {
    if (!this.isModified('name')) return next();
    this.slug = slugify(this.name, { lower: true });
    next();
});

const Category = mongoose.model('Category', categorySchema);

export default Category;
