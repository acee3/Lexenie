import { Router } from 'express';
import { createConversation, retrieveConversation, sendMessage } from '../controllers/chatController.js';

const chatRouter = Router();

chatRouter.post('/create-conversation', createConversation);
chatRouter.post('/retrieve-conversation', retrieveConversation);
chatRouter.post('/send-message', sendMessage);

export default chatRouter;
