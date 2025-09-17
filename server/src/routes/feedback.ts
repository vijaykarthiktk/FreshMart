import { Router } from 'express';
import Feedback from '../models/Feedback.js';
import Product from '../models/Product.js';
import { AuthedRequest } from '../middleware/auth.js';

const router = Router();

// Create feedback for a product (requires auth)
router.post('/:productId', async (req: AuthedRequest, res) => {
    const { rating, comment } = req.body;
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const fb = await Feedback.create({ productId, userId: req.user!.uid, rating, comment });

    // Recompute avg rating quickly
    const agg = await Feedback.aggregate([
        { $match: { productId: fb.productId } },
        { $group: { _id: '$productId', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);
    const avg = agg[0]?.avg || 0;
    await Product.findByIdAndUpdate(productId, { avgRating: avg });

    res.status(201).json(fb);
});

// List feedback for a product
router.get('/:productId', async (req, res) => {
    const list = await Feedback.find({ productId: req.params.productId }).sort({ createdAt: -1 }).limit(20);
    res.json(list);
});

export default router;