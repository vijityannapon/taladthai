import { Schema, Document, model } from 'mongoose';

export interface CartProduct {
  productId: string;
  quantity: number;
}

export interface CartDocument extends Document {
  userId: string;
  products: CartProduct[];
  deletedAt?: Date;
}

const CartProductSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true },
});

export const CartSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  products: [CartProductSchema],
  deletedAt: { type: Date, default: null },
});

export const Cart = model<CartDocument>('Cart', CartSchema);
