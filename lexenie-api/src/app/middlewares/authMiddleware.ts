import { Request, Response, NextFunction } from 'express';
import { BackendError, NotFoundError, UnauthorizedError, UnknownError } from '../lib/errors.js';
import { UserData } from '../lib/types.js';
import { query, USER_TABLE_NAME } from '../index.js';
import { Socket } from 'socket.io';
import { ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData } from '../setup/websocket.js';
import { verifyToken } from '../setup/authSetup.js';

const authorizeToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.headers['authorization'])
      throw new UnauthorizedError("Authorization header is not provided");
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


interface AuthUserInfoRequest extends Request {
  userId: number;
}
const isAuthUserInfoRequest = (variable: any): variable is AuthUserInfoRequest => {
  return (variable as AuthUserInfoRequest).userId !== undefined;
}

const authorizeTokenWebsocket = async (socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>, next: (err?: Error) => void) => {
  try {
    if (!socket.handshake.query || !socket.handshake.query.token)
      throw new UnauthorizedError("Authorization header is not provided");

    const token = socket.handshake.query.token;
    if (token == null)
      throw new UnauthorizedError("Token is not provided");
    if (typeof token !== 'string')
      throw new UnauthorizedError("Token is not a string");

    const payload = verifyToken(token);
    const users = await query<UserData>(`SELECT * FROM ${USER_TABLE_NAME} WHERE username = ?`, [payload.username]);
    if (users.length == 0)
      throw new NotFoundError("Username does not exist in database");

    const user = users[0];
    socket.data.userId = user.user_id;
    next();
  } catch (error) {
    if (error instanceof BackendError) {
      // socket.emit("error", { name: error.name, message: error.message, status: error.status } as OutputError);
      next(error);
      return;
    }
    const unknownError = new UnknownError("An unknown error occurred when connecting.");
    // socket.emit("error", { name: unknownError.name, message: unknownError.message, status: unknownError.status } as OutputError);
    next(unknownError);
  }
}

// const authorizeTokenWebsocket = async (req: AuthUserInfoRequest, res: Response, next: NextFunction) => {
//   try {
//     if (!req.headers['authorization'])
//       throw new UnauthorizedError("Authorization header is not provided");
//     const authHeader = req.headers['authorization'];
//     const token = authHeader && authHeader.split(' ')[1];
//     if (token == null)
//       throw new UnauthorizedError("Token is not provided");
    
//     const payload = verifyToken(token);
//     const users = await query<UserData>(`SELECT * FROM ${USER_TABLE_NAME} WHERE username = ?`, [payload.username]);
//     if (users.length == 0)
//       throw new NotFoundError("Username does not exist in database");

//     const user = users[0];
//     req.userId = user.user_id;
    
//     next();
//   } catch (error) {
//     next(error);
//   }
// }


export { authorizeToken, authorizeTokenWebsocket, AuthUserInfoRequest, isAuthUserInfoRequest };