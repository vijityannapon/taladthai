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
import { Types } from 'mongoose';
import { Product } from './../products/schemas/product.schema';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel('Cart') private cartModel: Model<CartDocument>,
    @InjectModel('Product') private productModel: Model<Product>,
    @InjectModel('Order') private orderModel: Model<OrderDocument>,
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
      cartId,
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

  findAll() {
    return `This action returns all orders`;
  }

  findOne(id: string) {
    return `This action returns a #${id} order`;
  }

  update(id: string, updateOrderDto: UpdateOrderDto) {
    return `This action updates a #${id} order`;
  }

  remove(id: string) {
    return `This action removes a #${id} order`;
  }
}
