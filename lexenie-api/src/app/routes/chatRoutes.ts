import { Router } from 'express';
import { createConversation, retrieveConversation, sendMessage } from '../controllers/chatController.js';
import { io } from '../index.js'

export default async function getChatRouter() {
  const chatRouter = Router();

  chatRouter.post('/createConversation', createConversation);
  chatRouter.post('/retrieveConversation', retrieveConversation);

  io.on("connection", (socket) => {
    socket.on("sendMessage", (input) => {
      sendMessage(socket, socket.data.userId, input.conversationId, input.messageText);
    });
  });

  return chatRouter;
}