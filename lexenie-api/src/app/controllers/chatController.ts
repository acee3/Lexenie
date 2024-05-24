import { Request, Response, NextFunction } from 'express';
import { botResponse, query } from '../index';
import { Language, Message } from '../lib/types';
import { BackendError } from '../lib/errors';

const conversation_table_name = process.env.CONVERSATION_TABLE_NAME
const audio_file_table_name = process.env.AUDIO_FILE_TABLE_NAME
const message_table_name = process.env.MESSAGE_TABLE_NAME
const user_table_name = process.env.USER_TABLE_NAME

const retrieveConversation = async (req: Request, res: Response) => {
  const conversationId = req.body.conversationId;
  try {
      const prevMessages = await query<Message>(`SELECT * FROM ${message_table_name} WHERE conversation_id = ? ORDER BY created_at ASC`, [conversationId]);
      res.status(200).send(prevMessages);
  } catch (error) {
      if (error instanceof BackendError)
          res.status(error.status).send(error.message);
      res.status(500).send("Unknown error with retrieving conversation");
  }
};

const sendMessage = async (req: Request, res: Response) => {
  const conversationId = req.body.conversationId;
    const userId = req.body.userId;
    const messageText = req.body.messaggeText;
    const createdAt = req.body.createdAt;
    try {
        const prevMessages = await query<Message>(`SELECT * FROM ${message_table_name} WHERE conversation_id = ? ORDER BY created_at ASC`, [conversationId]);
        const languageRows = await query<Language>(`SELECT language FROM Conversations WHERE conversation_id = ?`, [conversationId]);
        const language = languageRows.length > 0 ? languageRows[0].language : "English";
        const responseText = await botResponse(language, prevMessages, messageText);
    } catch (error) {
        if (error instanceof BackendError)
            res.status(error.status).send(error.message);
        res.status(500).send("Unknown error with sending message");
    }
};

export { retrieveConversation, sendMessage };