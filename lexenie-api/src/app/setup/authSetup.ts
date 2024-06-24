import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { SetupError } from '../lib/errors';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
if (JWT_SECRET === undefined) {
  throw new SetupError("JWT_SECRET is not defined in .env file");
}

const generateToken = (username: string) => {
  return jwt.sign(username, JWT_SECRET, { expiresIn: '1h' });
}

export { generateToken };