import { Router } from 'express';
import { retrieveConversation, sendMessage } from '../controllers/chatController';

const chatRouter = Router();

chatRouter.post('/retrieve-conversation', retrieveConversation);
chatRouter.post('/send-message', sendMessage);

export default chatRouter;
