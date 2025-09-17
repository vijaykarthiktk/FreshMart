import { Router } from 'express';
import { authMiddleware, adminOnly } from '../middleware/auth.js';
import Product from '../models/Product.js';
import Feedback from '../models/Feedback.js';
import PriceHistory from '../models/PriceHistory.js';

const router = Router();

// Basic analytics endpoints
router.get('/analytics/overview', authMiddleware, adminOnly, async (_req, res) => {
    const [productCount, feedbackCount] = await Promise.all([
        Product.countDocuments(),
        Feedback.countDocuments(),
    ]);
    res.json({ productCount, feedbackCount });
});

router.get('/analytics/ratings', authMiddleware, adminOnly, async (_req, res) => {
    const ratings = await Feedback.aggregate([
        { $group: { _id: '$productId', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 50 },
    ]);
    res.json(ratings);
});

router.get('/analytics/price-trends/:productId', authMiddleware, adminOnly, async (req, res) => {
    const history = await PriceHistory.find({ productId: req.params.productId }).sort({ createdAt: 1 });
    res.json(history);
});

// Placeholder: sales/demand -> use feedback count as a proxy in demo
router.get('/analytics/demand', authMiddleware, adminOnly, async (_req, res) => {
    const demand = await Feedback.aggregate([
        { $group: { _id: '$productId', interactions: { $sum: 1 } } },
        { $sort: { interactions: -1 } },
        { $limit: 50 },
    ]);
    res.json(demand);
});

export default router;