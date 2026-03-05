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

const { applyCoupon } = await import('../controllers/couponController.js');
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
});
