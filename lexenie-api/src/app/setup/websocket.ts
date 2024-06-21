import { Server, Socket } from 'socket.io';
import http from 'http';
import { WebsocketNotConnectError } from '../lib/errors.js';
import { Error, InputChunk, OutputMessage, StartRecordingData, WaveChunks } from '../lib/types.js';

interface ServerToClientEvents {
  responseMessage: (response: OutputMessage) => void;
  error: (error: Error) => void;
}

interface ClientToServerEvents {
  startRecording: (input: StartRecordingData) => void;
  receiveAudioChunk: (input: InputChunk) => void;
  sendMessage: (input: number) => void;
}

interface InterServerEvents {

}

interface SocketData {
  userId: number;
  audioChunksMap: Map<number, WaveChunks>;
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