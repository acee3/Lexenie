import Router from 'express-promise-router';
import { createConversation, getConversations, retrieveMessages, startRecording, receiveAudioChunk, stopRecording, sendMessage, deleteConversation } from '../controllers/chatController.js';
import { io } from '../index.js'
import { authorizeToken, authorizeTokenWebsocket, isAuthUserInfoRequest } from '../middlewares/authMiddleware.js';

export default async function getChatRouter() {
  const chatRouter = Router();

  chatRouter.post('/createConversation', authorizeToken, createConversation);
  chatRouter.post('/deleteConversation', authorizeToken, deleteConversation);

  io.engine.use(authorizeTokenWebsocket);
  io.on("connection", (socket) => {
    if (!isAuthUserInfoRequest(socket.request))
      throw new Error("Socket request does not contain user id");
    socket.data.userId = socket.request.userId;

    socket.data.audioChunks = {waveData: {sampleRate: null, numberChannels: null, bytesPerSample: null}, chunks: [] as string[]};
    socket.data.conversationBatchNumber = 0;
    socket.data.currentConversationId = null;
    socket.data.messageBatchNumber = 0;

    getConversations(socket);
    retrieveMessages(socket);
    startRecording(socket);
    receiveAudioChunk(socket);
    stopRecording(socket);
    sendMessage(socket);
  });

  return chatRouter;
}