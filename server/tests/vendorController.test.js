import { jest } from '@jest/globals';

// Mock dependencies
jest.unstable_mockModule('../models/productModel.js', () => ({
    default: {
        find: jest.fn(),
        findOne: jest.fn(),
        findOneAndUpdate: jest.fn(),
        bulkWrite: jest.fn(),
    }
}));

jest.unstable_mockModule('../config/socket.js', () => ({
    emitLowStock: jest.fn(),
}));

const { getVendorProducts, updateInventory } = await import('../controllers/vendorController.js');
const { default: Product } = await import('../models/productModel.js');

describe('Vendor Controller', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            user: { id: 'vendor123' },
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

    describe('getVendorProducts', () => {
        it('should return products for authenticated vendor', async () => {
            const mockProducts = [{ id: 'p1', title: 'Product 1', vendor: 'vendor123' }];
            Product.find.mockReturnValue({
                sort: jest.fn().mockResolvedValue(mockProducts)
            });

            await getVendorProducts(req, res, next);

            expect(Product.find).toHaveBeenCalledWith({ vendor: 'vendor123' });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                status: 'success',
                results: 1
            }));
        });
    });

    describe('updateInventory', () => {
        it('should update and save product inventory', async () => {
            req.params.id = 'p1';
            req.body = { stock: 20, price: 99 };

            const mockProduct = {
                id: 'p1',
                vendor: 'vendor123',
                stock: 10,
                price: 50,
                save: jest.fn().mockResolvedValue(true)
            };

            Product.findOne.mockResolvedValue(mockProduct);

            await updateInventory(req, res, next);

            expect(mockProduct.stock).toBe(20);
            expect(mockProduct.price).toBe(99);
            expect(mockProduct.save).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('should return 404 if product not found for vendor', async () => {
            req.params.id = 'p2';
            Product.findOne.mockResolvedValue(null);

            await updateInventory(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.objectContaining({
                statusCode: 404
            }));
        });
    });
});
