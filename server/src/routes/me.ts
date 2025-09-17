import { Router } from 'express';
import { AuthedRequest, authMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/', authMiddleware, (req: AuthedRequest, res) => {
    const { uid, email, isAdmin } = req.user!;
    res.json({ uid, email, isAdmin });
});

export default router;