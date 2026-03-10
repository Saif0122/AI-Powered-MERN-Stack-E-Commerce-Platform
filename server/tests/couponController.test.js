import { jest } from '@jest/globals';

// Mocking dependencies
jest.unstable_mockModule('../models/couponModel.js', () => ({
    default: {
        findOne: jest.fn(),
        create: jest.fn(),
        find: jest.fn(),
        findByIdAndUpdate: jest.fn(),
        findOneAndUpdate: jest.fn(),
    }
}));

const { applyCoupon, createCoupon } = await import('../controllers/couponController.js');
const { default: Coupon } = await import('../models/couponModel.js');

describe('Coupon Controller', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            body: {},
            params: {},
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        };
        next = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('applyCoupon', () => {
        it('should apply percentage coupon successfully', async () => {
            req.body = { code: 'SAVE10', cartTotal: 100 };

            const mockCoupon = {
                code: 'SAVE10',
                type: 'percentage',
                value: 10,
                minCartValue: 50,
                usageLimit: 100,
                usedCount: 0,
                isActive: true,
                expiresAt: new Date(Date.now() + 100000)
            };

            Coupon.findOne.mockResolvedValue(mockCoupon);

            await applyCoupon(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    status: 'success',
                    data: expect.objectContaining({
                        discountAmount: 10,
                        newTotal: 90
                    })
                })
            );
        });

        it('should return 400 for expired coupon', async () => {
            req.body = { code: 'EXPIRED', cartTotal: 100 };

            Coupon.findOne.mockResolvedValue(null); // findOne filter includes expiry check

            await applyCoupon(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.objectContaining({
                statusCode: 400,
                message: 'Invalid or expired coupon code'
            }));
        });

        it('should return 400 for insufficient cart total', async () => {
            req.body = { code: 'MIN50', cartTotal: 30 };

            const mockCoupon = {
                code: 'MIN50',
                minCartValue: 50,
                isActive: true,
                expiresAt: new Date(Date.now() + 100000)
            };

            Coupon.findOne.mockResolvedValue(mockCoupon);

            await applyCoupon(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.objectContaining({
                statusCode: 400,
                message: expect.stringContaining('Minimum cart value')
            }));
        });
    });

    describe('createCoupon', () => {
        it('should create coupon successfully', async () => {
            req.body = {
                code: 'NEWYEAR',
                type: 'percentage',
                value: 20,
                usageLimit: 50
            };

            Coupon.create.mockResolvedValue({ ...req.body, _id: '123' });

            await createCoupon(req, res, next);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    status: 'success',
                    data: expect.objectContaining({
                        coupon: expect.objectContaining({ code: 'NEWYEAR' })
                    })
                })
            );
        });

        it('should return 400 if code is missing', async () => {
            req.body = { type: 'fixed', value: 10 };

            await createCoupon(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.objectContaining({
                statusCode: 400,
                message: 'Coupon code is required'
            }));
        });

        it('should return 400 if value is negative', async () => {
            req.body = { code: 'BAD', type: 'fixed', value: -5 };

            await createCoupon(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.objectContaining({
                statusCode: 400,
                message: 'A positive discount value is required'
            }));
        });

        it('should return 400 for duplicate coupon code', async () => {
            req.body = { code: 'DUP', type: 'fixed', value: 10 };

            const duplicateError = new Error('Duplicate key');
            duplicateError.code = 11000;
            Coupon.create.mockRejectedValue(duplicateError);

            await createCoupon(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.objectContaining({
                statusCode: 400,
                message: 'Coupon code already exists'
            }));
        });
    });
});
