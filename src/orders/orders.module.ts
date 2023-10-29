import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { CartsModule } from './../carts/carts.module';
import { MongooseModule } from '@nestjs/mongoose';
import { OrderSchema } from './schemas/order.schema';
import { UsersModule } from './../users/users.module';
import { ProductsModule } from './../products/products.module';
import { PaymentsModule } from './../payments/payments.module';
import { EmailsModule } from './../emails/emails.module';

@Module({
  imports: [
    CartsModule,
    EmailsModule,
    MongooseModule.forFeature([{ name: 'Order', schema: OrderSchema }]),
    PaymentsModule,
    ProductsModule,
    UsersModule,
  ],

  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
