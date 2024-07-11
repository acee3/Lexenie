import { Request, Response, NextFunction } from 'express';
import { botResponse, query, CONVERSATION_TABLE_NAME, MESSAGE_TABLE_NAME, USER_TABLE_NAME, BOT_USER_ID, generateToken, expiresIn } from '../index.js';
import { BackendError, UnknownError, ConflictError, UnauthorizedError, NotFoundError } from '../lib/errors.js';
import { CountData, UserData } from '../lib/types.js';
import bcrypt from 'bcrypt';

const createUser = async (req: Request, res: Response) => {
  try {
    const username: string = req.body.username;
    const password: string = req.body.password;
    const email: string = req.body.email;
    const createdAt: string = new Date().toISOString().substring(0, 23);

    // Check if the email is already registered
    const userExists = await query<CountData>(`SELECT COUNT(*) AS count FROM ${USER_TABLE_NAME} WHERE email = ?`, [email]);
    if (userExists[0].count != 0)
      throw new ConflictError("Username or email already exists in database");

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await query(`INSERT INTO ${USER_TABLE_NAME} (username, password_hash, email, created_at) VALUES (?, ?, ?, ?)`, [username, hashedPassword, email, createdAt]);

    const token = generateToken({ username: username });

    res.status(201).json({
      idToken: token,
      expiresIn: expiresIn
    });
  } catch (error) {
    if (error instanceof BackendError) {
      res.status(error.status).send(error.message);
      return;
    }
    const unknownError = new UnknownError("Unknown error with creating user.");
    res.status(unknownError.status).send(unknownError.message);
  }
}

const login = async (req: Request, res: Response) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const users = await query<UserData>(`SELECT * FROM ${USER_TABLE_NAME} WHERE email = ?`, [email]);
    if (users.length == 0)
      throw new NotFoundError("Email does not exist in database");

    const user = users[0];

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match)
      throw new UnauthorizedError("Password is incorrect");
    
    const token = generateToken({ username: user.username });
    res.status(200).json({
      idToken: token,
      expiresIn: expiresIn
    });
  } catch (error) {
    if (error instanceof BackendError) {
      res.status(error.status).send(error.message);
      return;
    }
    const unknownError = new UnknownError("Unknown error with logging in user.");
    res.status(unknownError.status).send(unknownError.message);
  }
}

export { createUser, login }