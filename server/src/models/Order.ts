import mongoose, { Schema, Document } from 'mongoose';

export interface IOrder extends Document {
    userId: string;
    productId: mongoose.Types.ObjectId;
    quantity: number;
    total: number;
    createdAt: Date;
    updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>({
    userId: { type: String, required: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1 },
    total: { type: Number, required: true, min: 0 },
}, { timestamps: true });

export default mongoose.model<IOrder>('Order', OrderSchema);