import { IsString, Length, IsNotEmpty } from 'class-validator';

export class SignUpUserDto {
  @IsNotEmpty()
  @IsString()
  @Length(5, 10)
  username: string;

  @IsNotEmpty()
  @IsString()
  @Length(6, 12)
  password: string;
}
