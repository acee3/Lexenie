import { Request, Response, NextFunction } from 'express';
import { botResponse, query, CONVERSATION_TABLE_NAME, MESSAGE_TABLE_NAME, USER_TABLE_NAME, BOT_USER_ID } from '../index.js';
import { LanguageData, MessageData, CountData, Language, WaveChunks } from '../lib/types.js';
import { AudioChunkSentBeforeStartRecordingError, BackendError, QueryError, UnknownError } from '../lib/errors.js';
import { Socket } from 'socket.io';
import { ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData } from '../setup/websocket.js';

const createConversation = async (req: Request, res: Response) => {
  try {
    const userId: number = req.body.userId;
    const language: Language = req.body.language;
    const startTime: string = new Date().toISOString().substring(0, 23);
    
    const userExists = await query<CountData>(`SELECT COUNT(*) AS count FROM ${USER_TABLE_NAME} WHERE user_id = ?`, [userId.toString()]);
    if (userExists[0].count != 0)
      throw new QueryError("User ID does not exist in database");

    await query(`INSERT INTO ${CONVERSATION_TABLE_NAME} (language, start_time, user_id) VALUES (?, ?, ?)`, [language, startTime, userId.toString()]);
    res.status(200);
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
    // res.status(200).send(prevMessages);
  } catch (error) {
    if (error instanceof BackendError) {
      res.status(error.status).send(error.message);
      return;
    }
    res.status(500).send("Unknown error with retrieving conversation");
  }
};

const startRecording = async (socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>) => {
  socket.on("startRecording", async (input) => {
    try {
      const conversationId: number = input.conversationId;
      const waveData = input.waveData;
      if (socket.data.audioChunksMap == undefined)
        socket.data.audioChunksMap = new Map<number, WaveChunks>();
      if (!socket.data.audioChunksMap.has(conversationId))
        socket.data.audioChunksMap.set(conversationId, { waveData: waveData, audioChunks: [] });
    } catch (error) {
      if (error instanceof BackendError) {
        socket.emit("error", { name: error.name, message: error.message, status: error.status });
        return;
      }
      const unknownError = new UnknownError("An unknown error occurred when starting to record.");
      socket.emit("error", { name: unknownError.name, message: unknownError.message, status: unknownError.status });
    }
  });
};

const receiveAudioChunk = async (socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>) => {
  socket.on("receiveAudioChunk", async (input) => {
    try {
      const conversationId: number = input.conversationId;

      const conversationExists = await query<CountData>(`SELECT COUNT(*) AS count FROM ${USER_TABLE_NAME} WHERE conversation_id = ?`, [conversationId.toString()]);
      if (conversationExists[0].count != 0) 
        throw new QueryError("Conversation ID does not exist in database");

      if (socket.data.audioChunksMap == undefined || !socket.data.audioChunksMap.has(conversationId))
        throw new AudioChunkSentBeforeStartRecordingError("Audio chunk sent before start recording");

      const audioChunk: string = input.audioChunk;
      socket.data.audioChunksMap.get(conversationId)?.audioChunks.push(audioChunk);
    } catch (error) {
      if (error instanceof BackendError) {
        socket.emit("error", { name: error.name, message: error.message, status: error.status });
        return;
      }
      const unknownError = new UnknownError("An unknown error occurred when receiving an audio chunk.");
      socket.emit("error", { name: unknownError.name, message: unknownError.message, status: unknownError.status });
    }
  });
}

const stopRecordingSendMessage = async (socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>) => {
  socket.on("sendMessage", async (input) => {
    try {
      const userId: number = socket.data.userId;
      const conversationId: number = input;
      const createdAt: string = new Date().toISOString().substring(0, 23);
      const audioFilePath: string = `${userId}/${conversationId}/${createdAt}.wav`;

      
      // upload to s3

      socket.data.audioChunksMap.delete(conversationId);

      const messageText: string = input.messageText;
      // HANDLE AUDIO FILE AND USE VAD TO DETECT WHEN STOP SPEAKING AND THEN TRANSCRIBE IT AND MAKE IT messageText
  
      const conversationExists = await query<CountData>(`SELECT COUNT(*) AS count FROM ${USER_TABLE_NAME} WHERE conversation_id = ?`, [conversationId.toString()]);
      if (conversationExists[0].count != 0)
        throw new QueryError("Conversation ID does not exist in database");
  
      await query(`INSERT INTO ${MESSAGE_TABLE_NAME} (conversation_id, user_id, message_text, created_at, audio_file_path) VALUES (?, ?, ?, ?, ?)`, [conversationId.toString(), userId.toString(), messageText, createdAt, audioFilePath]);
  
      const prevMessages = await query<MessageData>(`SELECT * FROM ${MESSAGE_TABLE_NAME} WHERE conversation_id = ? ORDER BY created_at ASC LIMIT 25`, [conversationId.toString()]);
      const languageRows = await query<LanguageData>(`SELECT language FROM ${CONVERSATION_TABLE_NAME} WHERE conversation_id = ?`, [conversationId.toString()]);
      const language = languageRows.length > 0 ? languageRows[0].language : "English";
      const responseText = await botResponse(language, prevMessages, messageText);
      const responseCreatedAt: string = new Date().toISOString().substring(0, 23);
      const responseAudioFilePath: string = `${BOT_USER_ID}/${conversationId}/${responseCreatedAt}.wav`;
      await query(`INSERT INTO ${MESSAGE_TABLE_NAME} (conversation_id, user_id, message_text, created_at, audio_file_path) VALUES (?, ?, ?, ?, ?)`, [conversationId.toString(), BOT_USER_ID, responseText, responseCreatedAt, responseAudioFilePath]);
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
  });
};

const deleteConversation = async (req: Request, res: Response) => {

}

export { createConversation, retrieveConversation, stopRecordingSendMessage };