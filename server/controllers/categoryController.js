import Category from '../models/categoryModel.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';

// @desc    Get all categories
// @route   GET /api/v1/categories
// @access  Public
export const getAllCategories = asyncHandler(async (req, res, next) => {
    const categories = await Category.find();
    res.status(200).json({
        status: 'success',
        results: categories.length,
        data: { categories },
    });
});

// @desc    Get single category by slug
// @route   GET /api/v1/categories/:slug
// @access  Public
export const getCategory = asyncHandler(async (req, res, next) => {
    const category = await Category.findOne({ slug: req.params.slug });

    if (!category) {
        return next(new AppError('No category found with that slug', 404));
    }

    res.status(200).json({
        status: 'success',
        data: { category },
    });
});

// @desc    Create category
// @route   POST /api/v1/categories
// @access  Private (Admin)
export const createCategory = asyncHandler(async (req, res, next) => {
    const newCategory = await Category.create(req.body);

    res.status(201).json({
        status: 'success',
        data: { category: newCategory },
    });
});

// @desc    Update category
// @route   PATCH /api/v1/categories/:id
// @access  Private (Admin)
export const updateCategory = asyncHandler(async (req, res, next) => {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!category) {
        return next(new AppError('No category found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: { category },
    });
});

// @desc    Delete category
// @route   DELETE /api/v1/categories/:id
// @access  Private (Admin)
export const deleteCategory = asyncHandler(async (req, res, next) => {
    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
        return next(new AppError('No category found with that ID', 404));
    }

    res.status(204).json({
        status: 'success',
        data: null,
    });
});
