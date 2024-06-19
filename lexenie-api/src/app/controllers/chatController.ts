import { Request, Response, NextFunction } from 'express';
import { botResponse, query, CONVERSATION_TABLE_NAME, AUDIO_FILE_TABLE_NAME, MESSAGE_TABLE_NAME, USER_TABLE_NAME, BOT_USER_ID } from '../index.js';
import { LanguageData, MessageData, CountData } from '../lib/types.js';
import { BackendError, QueryError, UnknownError } from '../lib/errors.js';
import { Socket } from 'socket.io';
import { ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData } from '../setup/websocket.js';

const createUser = async (req: Request, res: Response) => {

  // REMEMBER THAT ID IS AUTOMATIC

  const username = req.body.username;
  try {
    const [rows, fields] = await query(`INSERT INTO ${USER_TABLE_NAME} (username) VALUES (?)`, [username]);
    res.status(200).send(rows);
  } catch (error) {
    if (error instanceof BackendError) {
      res.status(error.status).send(error.message);
      return;
    }
    res.status(500).send("Unknown error with creating user");
  }
}

const login = async (req: Request, res: Response) => {

  // LOOK UP THE PROPER WAY TO DEAL WITH LOGIN

  const username = req.body.username;
  try {
    const [rows, fields] = await query(`INSERT INTO ${USER_TABLE_NAME} (username) VALUES (?)`, [username]);
    res.status(200).send(rows);
  } catch (error) {
    if (error instanceof BackendError) {
      res.status(error.status).send(error.message);
      return;
    }
    res.status(500).send("Unknown error with creating user");
  }
}

const createConversation = async (req: Request, res: Response) => {

  // REMEMBER THAT ID IS AND STATUS IS AUTOMATIC AND ENDDATE IS NOT NECESSARY

  const userId = req.body.userId;
  try {
    // const prevMessages = await query<Message>(`SELECT * FROM ${MESSAGE_TABLE_NAME} WHERE conversation_id = ? ORDER BY created_at ASC`, [conversationId]);
    // res.status(200).send(prevMessages);
  } catch (error) {
    if (error instanceof BackendError) {
      res.status(error.status).send(error.message);
      return;
    }
    res.status(500).send("Unknown error with retrieving conversation");
  }
};

const retrieveConversation = async (req: Request, res: Response) => {
  const conversationId = req.body.conversationId;
  try {
    const prevMessages = await query<MessageData>(`SELECT * FROM ${MESSAGE_TABLE_NAME} WHERE conversation_id = ? ORDER BY created_at ASC`, [conversationId]);
    res.status(200).send(prevMessages);
  } catch (error) {
    if (error instanceof BackendError) {
      res.status(error.status).send(error.message);
      return;
    }
    res.status(500).send("Unknown error with retrieving conversation");
  }
};

const sendMessage = async (socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>, userId: number, conversationId: number, messageText: string) => {
  try {
    const createdAt: string = new Date().toISOString().substring(0, 23);
    // TODO: Check if conversation exists and if it doesn't throw new error
    const conversationExists = await query<CountData>(`SELECT COUNT(*) AS count WHERE conversation_id = ?`, [conversationId.toString()])
    if (conversationExists[0].count != 0)
      throw new QueryError("Conversation ID does not exist in database");

    await query(`INSERT INTO ${MESSAGE_TABLE_NAME} (conversation_id, user_id, message_text, created_at) VALUES (?, ?, ?, ?)`, [conversationId.toString(), userId.toString(), messageText, createdAt]);

    const prevMessages = await query<MessageData>(`SELECT * FROM ${MESSAGE_TABLE_NAME} WHERE conversation_id = ? ORDER BY created_at ASC`, [conversationId.toString()]);
    const languageRows = await query<LanguageData>(`SELECT language FROM Conversations WHERE conversation_id = ?`, [conversationId.toString()]);
    const language = languageRows.length > 0 ? languageRows[0].language : "English";
    const responseText = await botResponse(language, prevMessages, messageText);
    const responseCreatedAt: string = new Date().toISOString().substring(0, 23);
    await query(`INSERT INTO ${MESSAGE_TABLE_NAME} (conversation_id, user_id, message_text, created_at) VALUES (?, ?, ?, ?)`, [conversationId.toString(), BOT_USER_ID, responseText, responseCreatedAt]);
    socket.emit("responseMessage", {
      conversationId: conversationId,
      userId: parseInt(BOT_USER_ID),
      messageText: responseText,
      createdAt: new Date(responseCreatedAt)
    });
  } catch (error) {
    if (error instanceof BackendError) {
      socket.emit("error", { name: error.name, message: error.message, status: error.status });
      return;
    }
    const unknownError = new UnknownError("An unknown error occurred when sending a message.");
    socket.emit("error", { name: unknownError.name, message: unknownError.message, status: unknownError.status });
  }
};

export { retrieveConversation, sendMessage, createConversation };