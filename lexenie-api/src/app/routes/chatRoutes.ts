import Router from 'express-promise-router';
import { createConversation, getConversations, retrieveMessages, startRecording, receiveAudioChunk, stopRecording, sendMessage, deleteConversation, processFullAudio } from '../controllers/chatController.js';
import { io } from '../index.js'
import { authorizeToken, authorizeTokenWebsocket, isAuthUserInfoRequest } from '../middlewares/authMiddleware.js';

export default async function getChatRouter() {
  const chatRouter = Router();

  chatRouter.post('/createConversation', authorizeToken, createConversation);
  chatRouter.post('/deleteConversation', authorizeToken, deleteConversation);

  io.use(authorizeTokenWebsocket)
  .on("connection", (socket) => {
    socket.data.audioChunks = {
      waveData: null, 
      chunks: null
    };
    socket.data.conversationBatchNumber = 0;
    socket.data.currentConversationId = null;
    socket.data.messageBatchNumber = 0;
    
    getConversations(socket);
    retrieveMessages(socket);
    startRecording(socket);
    receiveAudioChunk(socket);
    stopRecording(socket);
    sendMessage(socket);
    processFullAudio(socket);
  });

  return chatRouter;
}