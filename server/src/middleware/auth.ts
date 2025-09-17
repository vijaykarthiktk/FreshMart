import { Request, Response, NextFunction } from 'express';
import admin from 'firebase-admin';

// Initialize firebase-admin lazily using env JSON or individual creds
let initialized = false;
function initAdmin() {
    if (initialized) return;
    try {
        const credJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
        if (credJson && credJson.trim().startsWith('{')) {
            const serviceAccount = JSON.parse(credJson);
            if (!serviceAccount.project_id || typeof serviceAccount.project_id !== 'string') {
                throw new Error('Invalid service account JSON: missing project_id');
            }
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
        } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
            // Prefer ADC when a key file path is provided
            admin.initializeApp({
                credential: admin.credential.applicationDefault(),
            });
        } else {
            // Last resort: try default initialization (may work in some environments)
            admin.initializeApp();
        }
    } catch (_e) {
        // If parsing or direct init fails, try ADC explicitly
        admin.initializeApp({
            credential: admin.credential.applicationDefault(),
        });
    }
    initialized = true;
}

export interface AuthedRequest extends Request {
    user?: { uid: string; email?: string | null; isAdmin?: boolean };
}

export function authMiddleware(req: AuthedRequest, res: Response, next: NextFunction) {
    // Allow CORS preflight to pass through without auth
    if (req.method === 'OPTIONS') return next();

    initAdmin();
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
    if (!token) return res.status(401).json({ error: 'Missing token' });

    admin
        .auth()
        .verifyIdToken(token)
        .then((decoded) => {
            const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map((e) => e.trim()).filter(Boolean);
            const isAdmin = decoded.email ? adminEmails.includes(decoded.email) : false;
            req.user = { uid: decoded.uid, email: decoded.email || null, isAdmin };
            next();
        })
        .catch(() => res.status(401).json({ error: 'Invalid token' }));
}

export function adminOnly(req: AuthedRequest, res: Response, next: NextFunction) {
    if (!req.user?.isAdmin) return res.status(403).json({ error: 'Admin only' });
    next();
}