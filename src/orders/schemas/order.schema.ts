import { Schema, Document, model } from 'mongoose';

export interface OrderProduct {
  productId: string;
  quantity: number;
  name: string;
  price: number;
}

export interface OrderDocument extends Document {
  userId: string;
  products: OrderProduct[];
}

const OrderProductSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
});

export const OrderSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  products: [OrderProductSchema],
});

export const Order = model<OrderDocument>('Order', OrderSchema);
