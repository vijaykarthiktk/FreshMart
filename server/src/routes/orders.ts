import { Router } from 'express';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { AuthedRequest, authMiddleware } from '../middleware/auth.js';

const router = Router();

// Create order (requires auth)
router.post('/', authMiddleware, async (req: AuthedRequest, res) => {
    const { productId, quantity } = req.body;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    if (product.inventory < quantity) return res.status(400).json({ error: 'Insufficient inventory' });

    const total = product.price * quantity;
    const order = await Order.create({ userId: req.user!.uid, productId, quantity, total });

    // Update inventory
    await Product.findByIdAndUpdate(productId, { $inc: { inventory: -quantity } });

    res.status(201).json(order);
});

// List user's orders
router.get('/', authMiddleware, async (req: AuthedRequest, res) => {
    const orders = await Order.find({ userId: req.user!.uid }).populate('productId').sort({ createdAt: -1 });
    res.json(orders);
});

export default router;