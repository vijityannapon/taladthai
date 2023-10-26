import { IsString, Length, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  @Length(5, 10)
  name: string;

  @IsNotEmpty()
  @IsNumber()
  price: number;
}
