import {
  IsString,
  Length,
  IsNotEmpty,
  IsEmail,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class SignInUserDto {
  @IsNotEmpty()
  @IsEmail()
  username: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @MaxLength(32)
  @Matches(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/, {
    message: 'password too weak',
  })
  password: string;
}
