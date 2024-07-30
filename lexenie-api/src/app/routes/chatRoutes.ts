import Router from 'express-promise-router';
import { createConversation, getConversations, retrieveMessages, startRecording, receiveAudioChunk, stopRecording, sendMessage, deleteConversation } from '../controllers/chatController.js';
import { io } from '../index.js'
import { authorizeToken, authorizeTokenWebsocket } from '../middlewares/authMiddleware.js';

export default async function getChatRouter() {
  const chatRouter = Router();

  chatRouter.post('/createConversation', authorizeToken, createConversation);
  chatRouter.post('/deleteConversation', authorizeToken, deleteConversation);


  io.use(authorizeTokenWebsocket)
  .on("connection", (socket) => {
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