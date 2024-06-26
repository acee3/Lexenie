import Router from 'express-promise-router';
import { createConversation, retrieveConversation, startRecording, receiveAudioChunk, stopRecordingSendMessage, deleteConversation } from '../controllers/chatController.js';
import { io } from '../index.js'
import { authorizeToken } from '../middlewares/authMiddleware.js';

export default async function getChatRouter() {
  const chatRouter = Router();

  chatRouter.post('/createConversation', authorizeToken, createConversation);
  chatRouter.post('/retrieveConversation', authorizeToken, retrieveConversation);
  chatRouter.post('/deleteConversation', authorizeToken, deleteConversation);

  io.on("connection", (socket) => {
    startRecording(socket);
    receiveAudioChunk(socket);
    stopRecordingSendMessage(socket);
  });

  return chatRouter;
}