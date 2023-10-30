import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { SignInUserDto } from './../src/users/dto/sign-in-user.dto';
import { faker } from '@faker-js/faker';

const validSignInData = new SignInUserDto();
validSignInData.username = 'testUser';
describe('UsersController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  it('/v1/users/sign-in (POST) - Without body -Should be 400', () => {
    return request(app.getHttpServer())
      .post('/users/sign-in')
      .expect(400)
      .expect({
        statusCode: 400,
        message: [
          'username must be an email',
          'username should not be empty',
          'password too weak',
          'password must be shorter than or equal to 32 characters',
          'password must be longer than or equal to 8 characters',
          'password must be a string',
          'password should not be empty',
        ],
        error: 'Bad Request',
      });
  });

  it('/v1/users/sign-in (POST) - Invalid username format', () => {
    return request(app.getHttpServer())
      .post('/users/sign-in')
      .send({})
      .send({ username: faker.internet.userName() })
      .expect(400)
      .expect({
        statusCode: 400,
        message: [
          'username must be an email',
          'password too weak',
          'password must be shorter than or equal to 32 characters',
          'password must be longer than or equal to 8 characters',
          'password must be a string',
          'password should not be empty',
        ],
        error: 'Bad Request',
      });
  });

  it('/v1/users/sign-in (POST) - username format and not have password', () => {
    return request(app.getHttpServer())
      .post('/users/sign-in')
      .send({
        username: 'taladthaiinterview@yopmail.com',
      })
      .expect(400)
      .expect({
        statusCode: 400,
        message: [
          'password too weak',
          'password must be shorter than or equal to 32 characters',
          'password must be longer than or equal to 8 characters',
          'password must be a string',
          'password should not be empty',
        ],
        error: 'Bad Request',
      });
  });

  it('/v1/users/sign-in (POST) - Correct username & password', () => {
    return request(app.getHttpServer())
      .post('/users/sign-in')
      .send({
        username: 'taladthaiinterview@yopmail.com',
        password: 'aAaa#aa333aa1ee',
      })
      .expect(201)
      .then((response) => {
        expect(response.body).toEqual(
          expect.objectContaining({
            accessToken: expect.any(String),
            refreshToken: expect.any(String),
          }),
        );
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
