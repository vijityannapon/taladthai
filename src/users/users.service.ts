import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';

import { UpdateUserDto } from './dto/update-user.dto';

import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { SignInUserDto } from './dto/sign-in-user.dto';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async create(createUserDto: CreateUserDto) {
    const { username, password } = createUserDto;
    const user = new this.userModel({ username, password });
    try {
      return await user.save();
    } catch (error) {
      if (
        error.code === 11000 &&
        error.keyPattern &&
        error.keyPattern.username
      ) {
        throw new ConflictException('Username already exists.');
      } else {
        throw new InternalServerErrorException('Something went wrong.');
      }
    }
  }

  async signIn(signInUserDto: SignInUserDto) {
    const { username, password } = signInUserDto;
    const user = await this.userModel
      .findOne({ username, password })
      .select('-password')
      .exec();
    if (!user) {
      throw new UnauthorizedException('Invalid username or password.');
    }
    return user;
  }
  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
