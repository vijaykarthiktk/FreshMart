import dotenv from 'dotenv';
import mongoose from 'mongoose';
import admin from 'firebase-admin';
import fs from 'node:fs';
import path from 'node:path';
import Product from '../models/Product.js';
import Feedback from '../models/Feedback.js';

dotenv.config();

async function ensureFirebase() {
    if (admin.apps.length) return;

    // 1) Try JSON passed via env var
    const credJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (credJson) {
        try {
            const parsed = JSON.parse(credJson);
            admin.initializeApp({ credential: admin.credential.cert(parsed) });
            return;
        } catch (e) {
            console.warn('Invalid FIREBASE_SERVICE_ACCOUNT_JSON. Falling back to files.');
        }
    }

    // 2) Try GOOGLE_APPLICATION_CREDENTIALS path or local service-account.json
    const gacPath = (process.env.GOOGLE_APPLICATION_CREDENTIALS || '').trim();
    const candidates: string[] = [];
    if (gacPath) candidates.push(gacPath);
    candidates.push(path.resolve(process.cwd(), 'service-account.json'));

    for (const p of candidates) {
        try {
            if (p && fs.existsSync(p)) {
                const raw = fs.readFileSync(p, 'utf8');
                const json = JSON.parse(raw);
                admin.initializeApp({ credential: admin.credential.cert(json) });
                return;
            }
        } catch {
            // continue
        }
    }

    // 3) Last resort: rely on ADC (will fail if env isn't set up)
    admin.initializeApp();
}

async function mirrorProduct(p: any) {
    try {
        await ensureFirebase();
        const db = admin.firestore();
        await db.collection('products').doc(String(p._id)).set({
            name: p.name,
            description: p.description,
            price: p.price,
            inventory: p.inventory,
            seasonalTag: p.seasonalTag || null,
            avgRating: p.avgRating || 0,
            seeded: true,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
    } catch (e) {
        console.warn('Mirror failed', e);
    }
}

async function run() {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://freshmartAdmin:1234@cluster0.zddtdoa.mongodb.net/freshmart';
    await mongoose.connect(MONGODB_URI);

    // Clear optional (comment out if you don't want cleanup)
    await Product.deleteMany({});
    await Feedback.deleteMany({});

    const products = await Product.insertMany([
        {
            name: 'Bananas',
            description: 'Fresh Cavendish bananas',
            price: 0.59,
            inventory: 120,
            seasonalTag: 'Summer'
        },
        {
            name: 'Apples',
            description: 'Crisp Fuji apples',
            price: 1.29,
            inventory: 80,
            seasonalTag: 'Fall'
        },
        {
            name: 'Spinach',
            description: 'Organic baby spinach',
            price: 2.49,
            inventory: 45,
            seasonalTag: 'Spring'
        },
        {
            name: 'Tomatoes',
            description: 'Vine-ripened tomatoes',
            price: 1.99,
            inventory: 60,
            seasonalTag: 'Summer'
        }
    ]);

    // Seed some feedback
    const fakeUser = 'demo-user-uid';
    for (const p of products) {
        const entries = [
            { rating: 5, comment: `Love the ${p.name}!` },
            { rating: 4, comment: `${p.name} are pretty good.` },
            { rating: 3, comment: `Decent ${p.name}.` },
        ];
        for (const e of entries) {
            await Feedback.create({ productId: p._id, userId: fakeUser, rating: e.rating, comment: e.comment });
        }
        // compute avg
        const agg = await Feedback.aggregate([
            { $match: { productId: p._id } },
            { $group: { _id: '$productId', avg: { $avg: '$rating' } } },
        ]);
        const avg = agg[0]?.avg || 0;
        p.avgRating = avg;
        await p.save();
        await mirrorProduct(p);
    }

    console.log('Seed completed');
    await mongoose.disconnect();
}

run().catch((e) => {
    console.error(e);
    process.exit(1);
});