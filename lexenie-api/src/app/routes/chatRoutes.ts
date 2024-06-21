import Router from 'express-promise-router';
import { createConversation, retrieveConversation, stopRecordingSendMessage } from '../controllers/chatController.js';
import { io } from '../index.js'

export default async function getChatRouter() {
  const chatRouter = Router();

  chatRouter.post('/createConversation', createConversation);
  chatRouter.post('/retrieveConversation', retrieveConversation);

  io.on("connection", (socket) => {
    stopRecordingSendMessage(socket);
  });

  return chatRouter;
}