import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import * as uuid from 'uuid';
import { Request } from 'express';

import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { SignInUserDto } from './dto/sign-in-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { EmailsService } from './../emails/emails.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private emailsService: EmailsService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { username, password } = createUserDto;
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = new this.userModel({ username, password: hashedPassword });
    try {
      const createUser = await user.save();
      if (createUser) {
        this.emailsService.sendMail(
          createUserDto.username,
          'Welcome to Taladthai online store',
          `Hello ${createUserDto.username},

        Congratulations on successfully registering with Taladthai online store!

        Remember, if you have any questions, our support team is always here to help. You can reach out to us at info@taladthai.com.

        Thank you for choosing Taladthai online store. We look forward to seeing all the great things you'll achieve with us!

        Best regards,
        The Taladthai online store Team`,
        );

        return createUser;
      }
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

    const user = await this.userModel.findOne({ username }).exec();
    if (!user) {
      throw new UnauthorizedException('Invalid username or password.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid username or password.');
    }

    const userObj = user.toObject();
    delete userObj.password;

    return userObj;
  }

  findOne(id: string) {
    return this.userModel.findOne({ _id: id });
  }

  async sendResetPasswordEmail(host: string, email: string) {
    const user = await this.userModel.findOne({ username: email });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const resetToken = uuid.v4();
    const hashedToken = crypto.createHmac('sha256', resetToken).digest('hex');
    user.passwordResetToken = hashedToken;
    const saveToken = await user.save();

    const userResponse = saveToken.toObject();

    delete userResponse.password;

    this.emailsService.sendMail(
      user.username,
      'Reset your password',
      `Hello ${user.username},

      We received a request to reset the password for your account associated with this email address.

      If you did not request this change, you can safely ignore this email. No changes will be made.

      To reset your password, click on the link below:

      http://${host}/v1/users/reset-password?token=${hashedToken}


      Best regards,
      Taladthai online store Team
`,
    );
    return userResponse;
  }

  async resetPassword(token: string, password: string) {
    if (!token) {
      throw new NotFoundException('Token not found');
    }

    const user = await this.userModel.findOne({
      passwordResetToken: token,
    });

    if (!user) {
      throw new NotFoundException('Token not match');
    }

    try {
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(password, salt);
      user.password = hashedPassword;
      user.passwordResetToken = null;
      await user.save();

      const userResponse = user.toObject();

      delete userResponse.password;
      return userResponse;
    } catch (error) {
      throw new InternalServerErrorException('Error updating password.');
    }
  }
}
