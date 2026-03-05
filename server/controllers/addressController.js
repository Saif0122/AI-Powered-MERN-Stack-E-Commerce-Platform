import Address from '../models/addressModel.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';

// @desc    Get all addresses for logged in user
// @route   GET /api/v1/shipping
// @access  Private
export const getAddresses = asyncHandler(async (req, res, next) => {
    const addresses = await Address.find({ user: req.user.id }).sort('-createdAt');

    res.status(200).json({
        status: 'success',
        results: addresses.length,
        data: {
            addresses,
        },
    });
});

// @desc    Create new shipping address
// @route   POST /api/v1/shipping
// @access  Private
export const createAddress = asyncHandler(async (req, res, next) => {
    // Add user ID to body
    req.body.user = req.user.id;

    const address = await Address.create(req.body);

    res.status(201).json({
        status: 'success',
        data: {
            address,
        },
    });
});

// @desc    Update shipping address
// @route   PUT /api/v1/shipping/:id
// @access  Private
export const updateAddress = asyncHandler(async (req, res, next) => {
    let address = await Address.findOne({ _id: req.params.id, user: req.user.id });

    if (!address) {
        return next(new AppError('No address found with that ID or not authorized', 404));
    }

    // Explicitly update to trigger pre-save hook for isDefault
    Object.assign(address, req.body);
    await address.save();

    res.status(200).json({
        status: 'success',
        data: {
            address,
        },
    });
});

// @desc    Delete shipping address
// @route   DELETE /api/v1/shipping/:id
// @access  Private
export const deleteAddress = asyncHandler(async (req, res, next) => {
    const address = await Address.findOneAndDelete({ _id: req.params.id, user: req.user.id });

    if (!address) {
        return next(new AppError('No address found with that ID or not authorized', 404));
    }

    res.status(204).json({
        status: 'success',
        data: null,
    });
});

// @desc    Set address as default
// @route   PATCH /api/v1/shipping/:id/default
// @access  Private
export const setDefaultAddress = asyncHandler(async (req, res, next) => {
    const address = await Address.findOne({ _id: req.params.id, user: req.user.id });

    if (!address) {
        return next(new AppError('No address found with that ID or not authorized', 404));
    }

    address.isDefault = true;
    await address.save();

    res.status(200).json({
        status: 'success',
        data: {
            address,
        },
    });
});
