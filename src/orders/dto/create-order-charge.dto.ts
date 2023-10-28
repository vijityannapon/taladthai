import { IsString, IsNotEmpty, Length } from 'class-validator';

class CardDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  @Length(16, 16)
  number: string;

  @IsNotEmpty()
  @IsString()
  @Length(2, 2)
  expiration_month: string;

  @IsNotEmpty()
  @IsString()
  @Length(2, 2)
  expiration_year: string;

  @IsNotEmpty()
  @IsString()
  @Length(3, 4)
  security_code: string;
}

export class CreateOrderChargeDto {
  card: CardDto;
}
