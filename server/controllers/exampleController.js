import Example from '../models/exampleModel.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';

// @desc    Get all examples
// @route   GET /api/v1/examples
// @access  Public
export const getAll = asyncHandler(async (req, res) => {
    const examples = await Example.find();
    res.status(200).json({
        status: 'success',
        results: examples.length,
        data: examples,
    });
});

// @desc    Get single example by ID
// @route   GET /api/v1/examples/:id
// @access  Public
export const getOne = asyncHandler(async (req, res, next) => {
    const example = await Example.findById(req.params.id);
    if (!example) {
        return next(new AppError('No record found with that ID', 404));
    }
    res.status(200).json({ status: 'success', data: example });
});

// @desc    Create a new example
// @route   POST /api/v1/examples
// @access  Public
export const createOne = asyncHandler(async (req, res) => {
    const example = await Example.create(req.body);
    res.status(201).json({ status: 'success', data: example });
});

// @desc    Update an example
// @route   PATCH /api/v1/examples/:id
// @access  Public
export const updateOne = asyncHandler(async (req, res, next) => {
    const example = await Example.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });
    if (!example) {
        return next(new AppError('No record found with that ID', 404));
    }
    res.status(200).json({ status: 'success', data: example });
});

// @desc    Delete an example
// @route   DELETE /api/v1/examples/:id
// @access  Public
export const deleteOne = asyncHandler(async (req, res, next) => {
    const example = await Example.findByIdAndDelete(req.params.id);
    if (!example) {
        return next(new AppError('No record found with that ID', 404));
    }
    res.status(204).json({ status: 'success', data: null });
});
