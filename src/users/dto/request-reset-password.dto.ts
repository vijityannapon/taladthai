import { IsNotEmpty, IsEmail } from 'class-validator';

export class RequestResetPasswordDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
