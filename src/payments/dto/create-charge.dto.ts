import { IsString, IsInt, Length, Min, IsNotEmpty } from 'class-validator';

export class CardDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @Length(16, 16)
  number: string;

  @IsString()
  @Length(2, 2)
  expiration_month: string;

  @IsString()
  @Length(2, 2)
  expiration_year: string;

  @IsString()
  @Length(3, 3)
  security_code: string;
}

export class CreateChargeDto {
  @IsNotEmpty()
  card: CardDto;

  @IsNotEmpty()
  customerId: string;

  @IsNotEmpty()
  orderId: string;

  @IsInt()
  @Min(1)
  amount: number;
}
