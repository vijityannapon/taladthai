import { Request } from 'express';

export interface JwtPayload {
  username: string;
  sub: string;
  iat: number;
  exp: number;
}

export interface JwtRequest extends Request {
  user: JwtPayload;
}
