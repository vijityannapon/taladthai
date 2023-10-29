import { Injectable } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import * as Omise from 'omise';
import { CreateChargeDto } from './dto/create-charge.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PaymentsService {
  private omiseClient: any;

  constructor(private configService: ConfigService) {
    this.omiseClient = Omise({
      publicKey: this.configService.get('OMISE_PUBLIC_KEY'),
      secretKey: this.configService.get('OMISE_SECRET_KEY'),
    });
  }

  async createToken(cardData: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.omiseClient.tokens.create(
        {
          card: {
            name: cardData.name,
            number: cardData.number,
            expiration_month: cardData.expiration_month,
            expiration_year: cardData.expiration_year,
            security_code: cardData.security_code,
          },
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        },
      );
    });
  }

  async charge(createChargeDto: CreateChargeDto): Promise<any> {
    const { card, amount, customerId, orderId } = createChargeDto;
    const token = await this.createToken(card);
    console.log(amount);
    return new Promise((resolve, reject) => {
      this.omiseClient.charges.create(
        {
          amount: amount,
          currency: 'thb',
          card: token.id,
          description: `Payment Order #${orderId}`,
          metadata: {
            order_id: orderId,
            customer_id: customerId,
          },
        },
        (err, resp) => {
          if (err) {
            reject(err);
          } else {
            resolve(resp);
          }
        },
      );
    });
  }
  create(createPaymentDto: CreatePaymentDto) {
    return 'This action adds a new payment';
  }

  findAll() {
    return `This action returns all payments`;
  }

  findOne(id: number) {
    return `This action returns a #${id} payment`;
  }

  update(id: number, updatePaymentDto: UpdatePaymentDto) {
    return `This action updates a #${id} payment`;
  }

  remove(id: number) {
    return `This action removes a #${id} payment`;
  }
}
