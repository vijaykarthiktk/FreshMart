import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IProduct extends Document {
    name: string;
    description: string;
    price: number;
    inventory: number;
    seasonalTag?: string;
    avgRating?: number; // denormalized for faster reads
    createdAt: Date;
    updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    inventory: { type: Number, required: true, min: 0 },
    seasonalTag: { type: String },
    avgRating: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model<IProduct>('Product', ProductSchema);