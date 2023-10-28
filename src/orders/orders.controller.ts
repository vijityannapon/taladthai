import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  NotFoundException,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { CreateOrderChargeDto } from './dto/create-order-charge.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { JwtAuthGuard } from './../users/guards/jwt-auth.guard';
import { JwtRequest } from './../users/interfaces/jwt-payload.interface';
import { UsersService } from './../users/users.service';
import { PaymentsService } from 'src/payments/payments.service';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly paymentsService: PaymentsService,
    private readonly usersService: UsersService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Req() req: JwtRequest, @Body() createOrderDto: CreateOrderDto) {
    const userId = req.user.sub;
    const user = await this.usersService.findOne(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    createOrderDto.userId = userId;
    return this.ordersService.create(createOrderDto);
  }

  @Post(':id/charge')
  @UseGuards(JwtAuthGuard)
  async charge(
    @Req() req: JwtRequest,
    @Param('id') id: string,
    @Body() createOrderChargeDto: CreateOrderChargeDto,
  ) {
    const { card } = createOrderChargeDto;
    const order = await this.ordersService.findOne(id);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const totalPrice = order.products.reduce((total, product) => {
      return Math.round((total + product.price * product.quantity) * 100);
    }, 0);

    const userId = req.user.sub;
    const chargeSchema = {
      customerId: userId,
      orderId: id,
      card,
      amount: totalPrice,
    };
    const payment = await this.paymentsService.charge(chargeSchema);
    if (payment.status === 'successful') {
      return await this.ordersService.updatePayment(id, payment);
    }

    return payment.status;
  }

  @Get()
  findAll() {
    return this.ordersService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(id, updateOrderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ordersService.remove(id);
  }
}
