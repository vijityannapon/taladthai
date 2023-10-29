import {
  IsString,
  Length,
  IsNotEmpty,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class SignUpUserDto {
  @IsNotEmpty()
  @IsString()
  @Length(5, 10)
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
