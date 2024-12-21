import { Server } from 'socket.io';
import http from 'http';
import { OutputError, Option, OutputConversation, OutputMessage, StartRecordingData, WaveChunks, InputOutputMessage } from '../lib/types.js';

interface ServerToClientEvents {
  error: (error: OutputError) => void;
}

interface ClientToServerEvents {
  getConversations: (callback: (response: OutputConversation[]) => void) => void;
  retrieveMessages: (conversationId: number, callback: (response: OutputMessage[]) => void) => void;
  startRecording: (input: StartRecordingData, callback: (response: string) => void) => void;
  receiveAudioChunk: (audioChunk: string, callback: (response: string) => void) => void;
  stopRecording: (callback: (response: string) => void) => void;
  sendMessage: (conversationId: number, messageText: string, callback: (response: OutputMessage) => void) => void;
  processFullAudio: (conversationId: number, audio: string, audioType: string, callback: (response: InputOutputMessage) => void) => void;
}

interface InterServerEvents {

}

interface SocketData {
  userId: number;
  audioChunks: WaveChunks;
  conversationBatchNumber: number;
  currentConversationId: Option<number>;
  messageBatchNumber: number;
}

export { ServerToClientEvents, ClientToServerEvents, InterServerEvents, SocketData }


const WEBSOCKET_CORS = {
  origin: "*",
  methods: ["GET", "POST"],
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