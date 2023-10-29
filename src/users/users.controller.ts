import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  UseGuards,
  Req,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { SignInUserDto } from './dto/sign-in-user.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRequest } from './interfaces/jwt-payload.interface';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('users')
export class UsersController {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Post('sign-in')
  async v1SignIn(@Body() signInUserDto: SignInUserDto) {
    const user = await this.usersService.signIn(signInUserDto);
    const accessPayload = {
      type: 'access',
      sub: user._id,
    };
    const refreshPayload = {
      type: 'refresh',
      sub: user._id,
    };

    return {
      accessToken: this.jwtService.sign(accessPayload, { expiresIn: '60m' }),
      refreshToken: this.jwtService.sign(refreshPayload, { expiresIn: '90d' }),
    };
  }

  @Post('refresh-token')
  @UseGuards(JwtAuthGuard)
  async v1RefreshToken(@Req() req: JwtRequest) {
    const userId = req.user.sub;
    const user = await this.usersService.findOne(userId);
    const accessPayload = {
      type: 'access',
      sub: user._id,
    };

    return {
      accessToken: this.jwtService.sign(accessPayload, { expiresIn: '60m' }),
    };
  }

  @Put('reset/password')
  @UseGuards(JwtAuthGuard)
  async v1ResetPassword(
    @Req() req: JwtRequest,
    @Body() resetPasswordDto: ResetPasswordDto,
  ) {
    const userId = req.user.sub;
    const user = await this.usersService.findOne(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { oldPassword, newPassword } = resetPasswordDto;

    if (oldPassword !== user.password) {
      throw new BadRequestException('Old password does not match');
    }

    user.password = newPassword;
    await user.save();

    return {
      status: 'success',
      message: 'Password updated successfully',
    };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }
}
