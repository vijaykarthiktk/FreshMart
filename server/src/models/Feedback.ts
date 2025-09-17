import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IFeedback extends Document {
    productId: Types.ObjectId;
    userId: string; // Firebase uid
    rating: number; // 1-5
    comment?: string;
    createdAt: Date;
}

const FeedbackSchema = new Schema<IFeedback>({
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    userId: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String },
}, { timestamps: { createdAt: true, updatedAt: false } });

export default mongoose.model<IFeedback>('Feedback', FeedbackSchema);