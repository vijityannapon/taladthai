import { IsString, Length, IsNotEmpty, IsEmail } from 'class-validator';

export class SignInUserDto {
  @IsNotEmpty()
  @IsEmail()
  username: string;

  @IsNotEmpty()
  @IsString()
  @Length(6, 12)
  password: string;
}
