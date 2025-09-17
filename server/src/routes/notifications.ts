import { Router } from 'express';
import { AuthedRequest } from '../middleware/auth.js';
import admin from 'firebase-admin';

const router = Router();

router.post('/broadcast', async (req: AuthedRequest, res) => {
    if (!req.user?.isAdmin) return res.status(403).json({ error: 'Admin only' });
    const { title, message } = req.body;

    // For realtime UX, we will write to Firestore collection 'notifications'
    // Clients will listen to snapshots and show instantly
    const db = admin.firestore();
    const doc = await db.collection('notifications').add({
        title, message, createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(201).json({ id: doc.id });
});

export default router;