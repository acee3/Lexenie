import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { SetupError, UnauthorizedError } from '../lib/errors.js';
import { TokenData } from '../lib/types.js';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
if (JWT_SECRET === undefined) {
  throw new SetupError("JWT_SECRET is not defined in .env file");
}

const generateToken = (payload: TokenData) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
}

const verifyToken = (token: string) => {
  const payload = jwt.verify(token, JWT_SECRET);
  if (typeof payload === 'string')
    throw new UnauthorizedError("Payload is incorrect");

  const isTokenData = (payload: any): payload is TokenData => {
    return payload.username;
  }
  if (!isTokenData(payload))
    throw new UnauthorizedError("Payload is incorrect");

  return payload;
}

export { generateToken, verifyToken };