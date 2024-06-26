import { Request, Response, NextFunction } from 'express';
import { BackendError, NotFoundError, UnauthorizedError, UnknownError } from '../lib/errors.js';
import { UserData } from '../lib/types.js';
import { query, verifyToken, USER_TABLE_NAME } from '../index.js';

const authorizeToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null)
      throw new UnauthorizedError("Token is not provided");
    
    const payload = verifyToken(token);
    const users = await query<UserData>(`SELECT * FROM ${USER_TABLE_NAME} WHERE username = ?`, [payload.username]);
    if (users.length == 0)
      throw new NotFoundError("Username does not exist in database");

    const user = users[0];
    req.body.userId = user.user_id;

    next();
  } catch (error) {
    if (error instanceof BackendError) {
      res.status(error.status).send(error.message);
      return;
    }
    const unknownError = new UnknownError("Unknown error with logging in user.");
    res.status(unknownError.status).send(unknownError.message);
  }
}

export { authorizeToken };