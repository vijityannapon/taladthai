import { Module } from '@nestjs/common';

import { CartsController } from './carts.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Cart, CartSchema } from './schemas/cart.schema';
import { CartsService } from './carts.service';
import { ProductsModule } from './../products/products.module';

@Module({
  imports: [
    ProductsModule,
    MongooseModule.forFeature([{ name: 'Cart', schema: CartSchema }]),
  ],
  controllers: [CartsController],
  providers: [CartsService],
  exports: [MongooseModule.forFeature([{ name: 'Cart', schema: CartSchema }])],
})
export class CartsModule {}
