import { Schema, Document, model } from 'mongoose';

export interface PaymentInfo {
  status: string;
  amount: number;
}

export interface OrderProduct {
  productId: string;
  quantity: number;
  name: string;
  price: number;
}

export interface OrderDocument extends Document {
  userId: string;
  products: OrderProduct[];
  payments: PaymentInfo[];
}

const PaymentInfoSchema = new Schema({
  status: { type: String, default: 'pending' },
  amount: { type: Number },
  paymentResponse: Schema.Types.Mixed,
});

const OrderProductSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
});

export const OrderSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  products: [OrderProductSchema],
  payments: [PaymentInfoSchema],
});

export const Order = model<OrderDocument>('Order', OrderSchema);
