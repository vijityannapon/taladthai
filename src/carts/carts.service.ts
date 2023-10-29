import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product } from './../products/schemas/product.schema';
import { Cart, CartDocument } from './schemas/cart.schema';

@Injectable()
export class CartsService {
  constructor(
    @InjectModel('Cart') private readonly cartModel: Model<CartDocument>,
    @InjectModel('Product')
    private readonly productModel: Model<Product>,
  ) {}
  create(createCartDto: CreateCartDto) {
    return this.cartModel.create(createCartDto);
  }

  findAll() {
    return this.cartModel.find({ deletedAt: null }).exec();
  }

  async findOne(id: string): Promise<CartDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid ID format');
    }

    const cart = await this.cartModel.findById(id);
    if (!cart) {
      throw new NotFoundException(`Cart with ID ${id} not found`);
    }
    return cart;
  }

  async update(
    cartId: string,
    updateCartDto: UpdateCartDto,
  ): Promise<CartDocument> {
    const cart = await this.cartModel.findOne({ _id: cartId, deletedAt: null });

    if (!cart) throw new NotFoundException('Cart not found');

    if (cart.userId) {
      throw new BadRequestException('Cart already belongs to a user');
    }

    if (!updateCartDto.products || !Array.isArray(updateCartDto.products)) {
      throw new BadRequestException('Invalid products data');
    }

    for (const productData of updateCartDto.products) {
      const existingProductIndex = cart.products.findIndex(
        (prod) => prod.productId.toString() === productData.productId,
      );

      if (existingProductIndex !== -1) {
        cart.products[existingProductIndex].quantity += productData.quantity;
      } else {
        cart.products.push(productData);
      }
    }

    return cart.save();
  }

  async remove(id: string) {
    const cart = await this.cartModel.findById(id);
    if (!cart) {
      throw new NotFoundException(`Cart with ID ${id} not found`);
    }
    cart.deletedAt = new Date();
    return cart.save();
  }
}
