import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IPriceHistory extends Document {
    productId: Types.ObjectId;
    oldPrice: number;
    newPrice: number;
    changedBy: string; // admin uid or email
    reason?: string;
    createdAt: Date;
}

const PriceHistorySchema = new Schema<IPriceHistory>({
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    oldPrice: { type: Number, required: true },
    newPrice: { type: Number, required: true },
    changedBy: { type: String, required: true },
    reason: { type: String },
}, { timestamps: { createdAt: true, updatedAt: false } });

export default mongoose.model<IPriceHistory>('PriceHistory', PriceHistorySchema);