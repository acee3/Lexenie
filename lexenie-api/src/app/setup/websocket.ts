import { Server } from 'socket.io';
import http from 'http';
import { WebsocketNotConnectError } from '../lib/errors.js';

interface ServerToClientEvents {
  noArg: () => void;
  basicEmit: (a: number, b: string, c: Buffer) => void;
  withAck: (d: string, callback: (e: number) => void) => void;
}

interface ClientToServerEvents {
  hello: () => void;
}

interface InterServerEvents {
  ping: () => void;
}

interface SocketData {
  name: string;
  age: number;
}

const WEBSOCKET_CORS = {
  origin: "*",
  methods: ["GET", "POST"]
}

export default class Websocket extends Server {

  private static io: Websocket;

  constructor(httpServer: http.Server) {
    super(httpServer, {
      cors: WEBSOCKET_CORS
    });
  }

  public static getInstance(httpServer?: http.Server): Websocket {
    if (!Websocket.io) {
      if (!httpServer) 
        throw new WebsocketNotConnectError("No server provided to connect websocket");
      Websocket.io = new Websocket(httpServer);
    }

    return Websocket.io;
  }
}