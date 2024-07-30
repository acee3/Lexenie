import { Request, Response, NextFunction } from 'express';
import { BackendError, NotFoundError, UnauthorizedError, UnknownError } from '../lib/errors.js';
import { UserData, WaveChunks } from '../lib/types.js';
import { query, verifyToken, USER_TABLE_NAME } from '../index.js';
import { ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData } from '../setup/websocket.js';
import { Socket } from 'socket.io';
import { ExtendedError } from 'socket.io/dist/namespace.js';

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

const authorizeTokenWebsocket = async (socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>, next: (err?: ExtendedError) => void) => {
  if (!socket.handshake.query || !socket.handshake.query.token) {
    next(new UnauthorizedError("Token is not provided"));
    return;
  }

  if (typeof socket.handshake.query.token !== 'string') {
    next(new UnauthorizedError("Token is not a string"));
    return;
  }
  
  const payload = verifyToken(socket.handshake.query.token);
  const users = await query<UserData>(`SELECT * FROM ${USER_TABLE_NAME} WHERE username = ?`, [payload.username]);
  if (users.length == 0)
    throw new NotFoundError("Username does not exist in database");
  
  const user = users[0];
  socket.data.userId = user.user_id;
}

export { authorizeToken, authorizeTokenWebsocket };