import { Request, Response, NextFunction } from 'express';
import { botResponse, query, CONVERSATION_TABLE_NAME, MESSAGE_TABLE_NAME, USER_TABLE_NAME, BOT_USER_ID, generateToken, expiresIn, insertQuery } from '../index.js';
import { BackendError, UnknownError, ConflictError, UnauthorizedError, NotFoundError } from '../lib/errors.js';
import { CountData, UserData } from '../lib/types.js';
import bcrypt from 'bcrypt';

const createUser = async (req: Request, res: Response, next: NextFunction) => {
  const username: string = req.body.username;
  const password: string = req.body.password;
  const email: string = req.body.email;
  const createdAt: string = new Date().toISOString().substring(0, 23);

  // Check if the email is already registered
  const userExists = await query<CountData>(`SELECT COUNT(*) AS count FROM ${USER_TABLE_NAME} WHERE email = ?`, [email]);
  if (userExists[0].count != 0) {
    next(new ConflictError("Username or email already exists in database"));
    return;
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const userId = await insertQuery(`INSERT INTO ${USER_TABLE_NAME} (username, password_hash, email, created_at) VALUES (?, ?, ?, ?)`, [username, hashedPassword, email, createdAt]);

  const token = generateToken({ username: username });

  res.status(201).json({
    idToken: token,
    expiresIn: expiresIn,
    userId: userId
  });
}

const login = async (req: Request, res: Response, next: NextFunction) => {
  const email = req.body.email;
  const password = req.body.password;

  const users = await query<UserData>(`SELECT * FROM ${USER_TABLE_NAME} WHERE email = ?`, [email]);
  if (users.length == 0) {
    next(new NotFoundError("Email does not exist in database"));
    return;
  }

  const user = users[0];

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) {
    next(new UnauthorizedError("Password is incorrect"));
    return;
  }
  
  const token = generateToken({ username: user.username });
  res.status(200).json({
    idToken: token,
    expiresIn: expiresIn,
    userId: user.user_id
  });
}

export { createUser, login }