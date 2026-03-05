import { jest } from '@jest/globals';

// We need to use unstable_mockModule for ESM mocking of dependencies
jest.unstable_mockModule('../models/wishlistModel.js', () => ({
    default: {
        findOne: jest.fn(),
        create: jest.fn(),
    }
}));

// Now we can dynamic import the controller and the mock
const { getWishlist, addToWishlist } = await import('../controllers/wishlistController.js');
const { default: Wishlist } = await import('../models/wishlistModel.js');

describe('Wishlist Controller', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            user: { id: 'user123' },
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

    describe('getWishlist', () => {
        it('should return 200 and wishlist data', async () => {
            const mockWishlist = {
                user: 'user123',
                items: [],
                populate: jest.fn().mockResolvedValue({
                    user: 'user123',
                    items: []
                })
            };

            Wishlist.findOne.mockReturnValue({
                populate: jest.fn().mockResolvedValue(mockWishlist)
            });

            await getWishlist(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    status: 'success',
                })
            );
        });
    });

    describe('addToWishlist', () => {
        it('should add product and return 200', async () => {
            req.body.productId = 'prod123';
            const mockWishlist = {
                user: 'user123',
                items: [],
                save: jest.fn().mockResolvedValue(true),
                populate: jest.fn().mockResolvedValue(true)
            };

            Wishlist.findOne.mockResolvedValue(mockWishlist);

            await addToWishlist(req, res, next);

            expect(mockWishlist.items).toHaveLength(1);
            expect(mockWishlist.save).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('should return error if product already exists', async () => {
            req.body.productId = 'prod123';
            const mockWishlist = {
                user: 'user123',
                items: [{ product: { toString: () => 'prod123' } }],
            };

            Wishlist.findOne.mockResolvedValue(mockWishlist);

            await addToWishlist(req, res, next);

            expect(next).toHaveBeenCalled();
            const error = next.mock.calls[0][0];
            expect(error.statusCode).toBe(400);
            expect(error.message).toBe('Product already in wishlist');
        });
    });
});
