import { Request, Response, NextFunction } from 'express';
import { botResponse, query, CONVERSATION_TABLE_NAME, MESSAGE_TABLE_NAME, USER_TABLE_NAME, BOT_USER_ID } from '../index.js';
import { BackendError, QueryError, UnknownError } from '../lib/errors.js';

const createUser = async (req: Request, res: Response) => {

  // REMEMBER THAT ID IS AUTOMATIC

  try {
    const username = req.body.username;
    const [rows, fields] = await query(`INSERT INTO ${USER_TABLE_NAME} (username) VALUES (?)`, [username]);
    res.status(200).send(rows);
  } catch (error) {
    if (error instanceof BackendError) {
      res.status(error.status).send(error.message);
      return;
    }
    res.status(500).send("Unknown error with creating user");
  }
}

const login = async (req: Request, res: Response) => {

  // LOOK UP THE PROPER WAY TO DEAL WITH LOGIN

  try {
    const username = req.body.username;
    const [rows, fields] = await query(`INSERT INTO ${USER_TABLE_NAME} (username) VALUES (?)`, [username]);
    res.status(200).send(rows);
  } catch (error) {
    if (error instanceof BackendError) {
      res.status(error.status).send(error.message);
      return;
    }
    res.status(500).send("Unknown error with creating user");
  }
}

export { createUser, login }