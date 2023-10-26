import { Exclude } from 'class-transformer';
import { IsString, Length, IsNotEmpty } from 'class-validator';

export class SignInUserDto {
  @IsNotEmpty()
  @IsString()
  @Length(6, 12)
  username: string;

  @IsNotEmpty()
  @IsString()
  @Length(6, 12)
  password: string;
}
