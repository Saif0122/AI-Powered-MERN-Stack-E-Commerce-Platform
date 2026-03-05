import express from 'express';
import mongoose from 'mongoose';
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit, 10) || 4;
        const Product = mongoose.models.Product;

        if (!Product) {
            return res.status(200).json({ status: 'success', data: { products: [] } });
        }

        const products = await Product.find().sort({ ratingsAverage: -1 }).limit(limit);
        res.status(200).json({
            status: 'success',
            data: { products }
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Failed to fetch public recommendations' });
    }
});

export default router;
