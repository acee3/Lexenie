import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { SetupError, UnauthorizedError } from '../lib/errors.js';
import { TokenData } from '../lib/types.js';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
if (JWT_SECRET === undefined) {
  throw new SetupError("JWT_SECRET is not defined in .env file");
}

const expiresIn = 20;
const generateToken = (payload: TokenData) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: expiresIn });
}

const verifyToken = (token: string) => {
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (typeof payload === 'string')
      throw new UnauthorizedError("Token payload is incorrect");
  
    const isTokenData = (payload: any): payload is TokenData => {
      return payload.username;
    }
    if (!isTokenData(payload))
      throw new UnauthorizedError("Token payload is incorrect");
  
    return payload;
  } catch (error) {
    throw new UnauthorizedError("Token is invalid: " + error);
  }
}

export { generateToken, verifyToken, expiresIn };