import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import productRouter from './routes/products.js';
import feedbackRouter from './routes/feedback.js';
import notificationRouter from './routes/notifications.js';
import meRouter from './routes/me.js';
import adminRouter from './routes/admin.js';
import orderRouter from './routes/orders.js';
import { authMiddleware } from './middleware/auth.js';

dotenv.config();

const app = express();
// CORS to allow Vite dev server (5173), same-origin, and ngrok URLs
app.use(cors({
    origin: [
        /^http:\/\/localhost:\d+$/,
        /^http:\/\/127\.0\.0\.1:\d+$/,
        /^https?:\/\/.*\.ngrok.*$/,
        /^https?:\/\/.*\.ngrok-free\.app$/
    ],
    credentials: true,
}));
app.use(express.json());
app.use(morgan('dev'));
// Handle preflight quickly
app.options('*', cors());

// Health
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// Routes
app.use('/api/products', productRouter);
app.use('/api/feedback', authMiddleware, feedbackRouter);
app.use('/api/notifications', authMiddleware, notificationRouter);
app.use('/api/me', meRouter);
app.use('/api/admin', adminRouter);
app.use('/api/orders', authMiddleware, orderRouter);

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://freshmartAdmin:1234@cluster0.zddtdoa.mongodb.net/freshmart';
const PORT = process.env.PORT || 4000;

async function start() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('MongoDB connected');
        app.listen(PORT, () => console.log(`API listening on :${PORT}`));
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

start();