import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CartDocument } from './../carts/schemas/cart.schema';
import { OrderDocument } from './schemas/order.schema';

import { Product } from './../products/schemas/product.schema';

import { User } from './../users/schemas/user.schema';
import { UsersService } from './../users/users.service';
import { EmailsService } from './../emails/emails.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel('Cart') private cartModel: Model<CartDocument>,
    @InjectModel('Product') private productModel: Model<Product>,
    @InjectModel('Order') private orderModel: Model<OrderDocument>,
    private emailsService: EmailsService,
    private readonly usersService: UsersService,
  ) {}

  async create(createOrderDto: CreateOrderDto) {
    const { cartId, products } = createOrderDto;
    const productIds = products.map((product) => product.productId);
    const productsData = await this.productModel.find({
      _id: { $in: productIds },
    });

    const cart = await this.cartModel.findOne({ _id: cartId });

    if (!cart) throw new NotFoundException('Cart not found');

    const orderedProducts = products.map((product) => {
      const productData = productsData.find(
        (pd) => pd._id.toString() === product.productId,
      );
      if (!productData) {
        throw new NotFoundException(
          `Product with ID ${product.productId} not found`,
        );
      }

      if (
        !cart.products.some(
          (cartProduct) =>
            cartProduct.productId.toString() === product.productId,
        )
      ) {
        throw new BadRequestException(
          `Product with ID ${product.productId} is not in the cart`,
        );
      }

      return {
        productId: product.productId,
        quantity: product.quantity,
        name: productData.name,
        price: productData.price,
      };
    });

    if (orderedProducts.length !== products.length) {
      throw new BadRequestException('Some products are not in the cart');
    }

    const newOrder = new this.orderModel({
      userId: cart.userId,
      products: orderedProducts,
    });

    await newOrder.save();

    cart.products = cart.products.filter(
      (product) =>
        !products.some((selected) => selected.productId === product.productId),
    );
    await cart.save();

    return newOrder;
  }

  async updatePayment(orderId: string, payment: any): Promise<any> {
    const order = await this.orderModel.findById(orderId);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const user = await this.usersService.findOne(order.userId);

    const newPayment = {
      status: payment.status,
      amount: payment.amount,
      paymentResponse: payment,
    };

    order.payments.push(newPayment);

    await order.save();
    const DateOfPurchase = new Date();

    this.emailsService.sendMail(
      user.username,
      'Confirmation of Your Payment at Taladthai online store',
      `Thank you for shopping with us at Taladthai online store. We are pleased to confirm that we have received your payment for Order #${
        order._id
      }. Here are the details:

      Order Number: ${order._id}
      Total Amount: ${(payment.amount / 100).toFixed(2)}
      Date: ${DateOfPurchase.toLocaleString()}


      Your order will be processed and shipped to the address provided. You can expect delivery by ${DateOfPurchase.toLocaleString()}.

      If you have any questions or concerns about your order, please feel free to reach out to our customer support team at info@taladthai.com or call us at 02-123-4567.

      Thank you for choosing Taladthai online store. We look forward to serving you again soon!

      Warm regards,
      The Taladthai online store Team
    `,
    );

    return order;
  }

  findAll() {
    return `This action returns all orders`;
  }

  findOne(id: string) {
    return this.orderModel.findOne({ _id: id });
  }

  update(id: string, updateOrderDto: UpdateOrderDto) {
    return `This action updates a #${id} order`;
  }

  remove(id: string) {
    return `This action removes a #${id} order`;
  }
}
