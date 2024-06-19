import { Server, Socket } from 'socket.io';
import http from 'http';
import { WebsocketNotConnectError } from '../lib/errors.js';
import { InputMessage, Error, OutputMessage } from '../lib/types.js';

interface ServerToClientEvents {
  responseMessage: (response: OutputMessage) => void;
  error: (error: Error) => void;
}

interface ClientToServerEvents {
  sendMessage: (input: InputMessage) => void;
}

interface InterServerEvents {

}

interface SocketData {
  userId: number;
}

export { ServerToClientEvents, ClientToServerEvents, InterServerEvents, SocketData }


const WEBSOCKET_CORS = {
  origin: "*",
  methods: ["GET", "POST"]
}

export default async function createWebsocket(httpServer: http.Server) {
  return new Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >(httpServer, {
    cors: WEBSOCKET_CORS
  });
}