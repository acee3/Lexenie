import { Request, Response, NextFunction } from 'express';
import { botResponse, query, CONVERSATION_TABLE_NAME, MESSAGE_TABLE_NAME, USER_TABLE_NAME, BOT_USER_ID } from '../index.js';
import { BackendError, QueryError, UnknownError } from '../lib/errors.js';
import { CountData } from '../lib/types.js';
import bcrypt from 'bcrypt';

const createUser = async (req: Request, res: Response) => {
  try {
    const username: string = req.body.username;
    const password: string = req.body.password;
    const email: string = req.body.email;
    const createdAt: string = new Date().toISOString().substring(0, 23);

    // Check if the email is already registered
    const userExists = await query<CountData>(`SELECT COUNT(*) AS count FROM ${USER_TABLE_NAME} WHERE username = ? OR email = ?`, [username, email]);
    if (userExists[0].count != 0)
      throw new QueryError("Conversation ID does not exist in database");

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await query(`INSERT INTO ${USER_TABLE_NAME} (username, password_hash, email, created_at) VALUES (?, ?, ?, ?)`, [username, hashedPassword, email, createdAt]);

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    if (error instanceof BackendError) {
      res.status(error.status).send(error.message);
      return;
    }
    res.status(500).send("Unknown error with creating user");
  }
}

const login = async (req: Request, res: Response) => {
  try {
    const username = req.body.username;
    const [rows, fields] = await query(`INSERT INTO ${USER_TABLE_NAME} (username) VALUES (?)`, [username]);
    res.status(200).send(rows);
  } catch (error) {
    if (error instanceof BackendError) {
      res.status(error.status).send(error.message);
      return;
    }
    res.status(500).send("Unknown error with logging in user");
  }
}

export { createUser, login }