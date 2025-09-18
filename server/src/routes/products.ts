import { Router } from 'express';
import Product from '../models/Product.js';
import PriceHistory from '../models/PriceHistory.js';
import { authMiddleware, adminOnly, AuthedRequest } from '../middleware/auth.js';
import admin from 'firebase-admin';

const router = Router();

function ensureAdminInit() {
    if (!admin.apps.length) {
        // This mirrors the lazy init in auth middleware; relies on ADC if no env
        admin.initializeApp();
    }
}

async function mirrorProductToFirestore(p: any) {
    try {
        ensureAdminInit();
        const db = admin.firestore();
        await db.collection('products').doc(String(p._id)).set({
            name: p.name,
            description: p.description,
            price: p.price,
            inventory: p.inventory,
            seasonalTag: p.seasonalTag || null,
            avgRating: p.avgRating || 0,
            hidden: p.hidden || false,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
    } catch (e) {
        // Log only; do not block API
        console.error('Mirror to Firestore failed', e);
    }
}

async function notifyPriceChange(name: string, newPrice: number) {
    try {
        ensureAdminInit();
        const db = admin.firestore();
        await db.collection('notifications').add({
            title: 'Price Update',
            message: `${name} now ${newPrice.toFixed(2)}`,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
    } catch (e) {
        console.error('Notify price change failed', e);
    }
}

// Public: list products
router.get('/', async (_req, res) => {
    const products = await Product.find({ hidden: { $ne: true } }).sort({ createdAt: -1 });
    res.json(products);
});

// Public: get single product
router.get('/:id', async (req, res) => {
    const p = await Product.findById(req.params.id);
    if (!p || p.hidden) return res.status(404).json({ error: 'Not found' });
    res.json(p);
});

// Admin: create product
router.post('/', authMiddleware, adminOnly, async (req: AuthedRequest, res) => {
    const { name, description, price, inventory, seasonalTag } = req.body;
    const p = await Product.create({ name, description, price, inventory, seasonalTag });
    await mirrorProductToFirestore(p);
    res.status(201).json(p);
});

// Admin: update product (price/inventory/name/etc.)
router.put('/:id', authMiddleware, adminOnly, async (req: AuthedRequest, res) => {
    const updates = req.body;
    const existing = await Product.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Not found' });

    // Track price changes
    const priceChanging = typeof updates.price === 'number' && updates.price !== existing.price;
    if (priceChanging) {
        await PriceHistory.create({
            productId: existing._id,
            oldPrice: existing.price,
            newPrice: updates.price,
            changedBy: req.user?.email || req.user?.uid || 'admin',
            reason: updates.reason,
        });
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (updated) {
        await mirrorProductToFirestore(updated);
        if (priceChanging) await notifyPriceChange(updated.name, updated.price);
    }
    res.json(updated);
});

// Admin: partial update (e.g., hide/show)
router.patch('/:id', authMiddleware, adminOnly, async (req: AuthedRequest, res) => {
    const updates = req.body;
    const updated = await Product.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!updated) return res.status(404).json({ error: 'Not found' });
    await mirrorProductToFirestore(updated);
    res.json(updated);
});

// Admin: delete
router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    // Optionally remove from Firestore mirror
    try {
        if (deleted) {
            ensureAdminInit();
            await admin.firestore().collection('products').doc(String(req.params.id)).delete();
        }
    } catch { }
    res.status(204).end();
});

// Optional: Auto-adjust price based on feedback/demand heuristics
router.post('/:id/auto-adjust', authMiddleware, adminOnly, async (req: AuthedRequest, res) => {
    const p = await Product.findById(req.params.id);
    if (!p) return res.status(404).json({ error: 'Not found' });

    // Simple heuristic:
    // - High avgRating (>4.5) and low inventory (<10) -> +10%
    // - Low avgRating (<3) -> -10%
    // - Otherwise small +2% to follow slight demand
    let factor = 1.02;
    if ((p.avgRating || 0) > 4.5 && p.inventory < 10) factor = 1.10;
    else if ((p.avgRating || 0) < 3) factor = 0.90;

    const newPrice = Math.max(0, Number((p.price * factor).toFixed(2)));

    const updated = await Product.findByIdAndUpdate(p._id, { price: newPrice }, { new: true });
    if (updated) {
        await PriceHistory.create({
            productId: updated._id,
            oldPrice: p.price,
            newPrice,
            changedBy: req.user?.email || req.user?.uid || 'auto',
            reason: 'auto-adjust',
        });
        await mirrorProductToFirestore(updated);
        await notifyPriceChange(updated.name, updated.price);
    }

    res.json(updated);
});

export default router;