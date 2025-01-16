import { Request, Response, NextFunction } from 'express';
import { query, CONVERSATION_TABLE_NAME, MESSAGE_TABLE_NAME, USER_TABLE_NAME, BOT_USER_ID, insertQuery } from '../index.js';
import { LanguageData, MessageData, CountData, Language, OutputMessage, IdData, ConversationData, OutputConversation, OutputError } from '../lib/types.js';
import { AudioChunkSentBeforeStartRecordingError, AudioNotRecordedError, BackendError, DeletedFileDoesNotExistError, QueryError, UnknownError } from '../lib/errors.js';
import { Socket } from 'socket.io';
import { ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData } from '../setup/websocket.js';
import { botResponse, combineAudioBase64, segmentAudioBase64, transcribeBase64, transcribeBuffer } from '../setup/modelSetup.js';
import path from 'path';
import fs from 'fs';

const createConversation = async (req: Request, res: Response, next: NextFunction) => {
  const userId: number = req.body.userId;
  const name: string = req.body.name;
  const language: Language = req.body.language;
  const startTime: string = new Date().toISOString().substring(0, 23);
  
  const userExists = await query<CountData>(`SELECT COUNT(*) AS count FROM ${USER_TABLE_NAME} WHERE user_id = ?`, [userId.toString()]);
  if (userExists[0].count == 0) {
    next(new QueryError("User ID does not exist in database"));
    return;
  }
  
  const conversationId = await insertQuery(`INSERT INTO ${CONVERSATION_TABLE_NAME} (name, language, start_time, last_time, user_id) VALUES (?, ?, ?, ?, ?)`, [name, language, startTime, startTime, userId.toString()]);
  const conversation: OutputConversation = {
    conversationId: conversationId,
    name: name,
    lastTime: new Date(startTime)
  };

  // Add starting text from bot
  const initialText = await botResponse(language, [], "");
  const initialCreatedAt: string = new Date().toISOString().substring(0, 23);
  await query(`INSERT INTO ${MESSAGE_TABLE_NAME} (conversation_id, user_id, message_text, created_at) VALUES (?, ?, ?, ?)`, [conversationId.toString(), BOT_USER_ID, initialText, initialCreatedAt]);

  res.status(200).send(conversation);
};

const getConversations = async (socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>) => {
  socket.on("getConversations", async callback => {
    try {
      const userId: number = socket.data.userId;
      const conversationBatchNumber = socket.data.conversationBatchNumber;
      const conversations = await query<ConversationData>(`SELECT * FROM ${CONVERSATION_TABLE_NAME} WHERE user_id = ? ORDER BY last_time DESC LIMIT 16 OFFSET ${conversationBatchNumber * 16}`, [userId.toString()]);
      const response: OutputConversation[] = conversations.map(conversation => {
        return {
          conversationId: conversation.conversation_id,
          name: conversation.name,
          lastTime: conversation.last_time
        }
      });
      callback(response);
    } catch (error) {
      if (error instanceof BackendError) {
        socket.emit("error", { name: error.name, message: error.message, status: error.status } as OutputError);
        return;
      }
      const unknownError = new UnknownError("An unknown error occurred when getting the conversations.");
      socket.emit("error", { name: unknownError.name, message: unknownError.message, status: unknownError.status } as OutputError);
    }
  });
};

const retrieveMessages = async (socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>) => {
  socket.on("retrieveMessages", async (conversationId, callback) => {
    try {
      const prevConversationId = socket.data.currentConversationId;
      if (prevConversationId != conversationId) {
        socket.data.messageBatchNumber = 0;
        socket.data.currentConversationId = conversationId;
      }
      const batchNumber = socket.data.messageBatchNumber;
      const prevMessages = await query<MessageData>(`SELECT * FROM ${MESSAGE_TABLE_NAME} WHERE conversation_id = ? ORDER BY created_at DESC LIMIT 16 OFFSET ${batchNumber * 16}`, [conversationId.toString()]);
      const response: OutputMessage[] = prevMessages.map(message => {
        return {
          messageId: message.message_id,
          conversationId: message.conversation_id,
          userId: message.user_id,
          messageText: message.message_text,
          createdAt: message.created_at
        }
      });
      callback(response);
    } catch (error) {
      if (error instanceof BackendError) {
        socket.emit("error", { name: error.name, message: error.message, status: error.status } as OutputError);
        return;
      }
      const unknownError = new UnknownError("An unknown error occurred when retrieving messages.");
      socket.emit("error", { name: unknownError.name, message: unknownError.message, status: unknownError.status } as OutputError);
    }
  });
};

const startRecording = async (socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>) => {
  socket.on("startRecording", async input => {
    try {
      const conversationId: number = input.conversationId;
      socket.data.currentConversationId = conversationId;
      const waveData = input.waveData;
      socket.data.audioChunks.waveData = waveData;
    } catch (error) {
      if (error instanceof BackendError) {
        socket.emit("error", { name: error.name, message: error.message, status: error.status } as OutputError);
        return;
      }
      const unknownError = new UnknownError("An unknown error occurred when starting to record.");
      socket.emit("error", { name: unknownError.name, message: unknownError.message, status: unknownError.status } as OutputError);
    }
  });
};

const receiveAudioChunk = async (socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>) => {
  socket.on("receiveAudioChunk", async (audioChunk, callback) => {
    try {
      if (socket.data.currentConversationId == null)
        throw new AudioChunkSentBeforeStartRecordingError("Audio chunk sent before conversation ID was set.");

      const conversationId: number = socket.data.currentConversationId;

      const conversationExists = await query<CountData>(`SELECT COUNT(*) AS count FROM ${CONVERSATION_TABLE_NAME} WHERE conversation_id = ?`, [conversationId.toString()]);
      if (conversationExists[0].count == 0) 
        throw new QueryError("Conversation ID does not exist in database");

      const waveData = socket.data.audioChunks.waveData;
      if (waveData == null)
        throw new AudioChunkSentBeforeStartRecordingError("Audio chunk sent before wave data was set.");
      
      const segmentData = await segmentAudioBase64(audioChunk, waveData);

      // console.log(audioChunk.length);
      // console.log(segmentData.length);
      // for (let i = 0; i < segmentData.length; i++)
      //   console.log(segmentData[i].length);
      // console.log("\n");

      if (segmentData.length == 0) {
        if (socket.data.audioChunks.chunks != null) {
          const prevText = await transcribeBuffer(socket.data.audioChunks.chunks, "wav");
          callback(prevText);
        } else
          callback("");
        return;
      }

      let newBuffer = null;
      if (segmentData.length > 1) {
        newBuffer = Buffer.from(segmentData[segmentData.length - 1].segment, 'base64');
        segmentData.pop();
      } 

      const segments = segmentData.map(segment => segment.segment);
      const combinedSegments = combineAudioBase64(socket.data.audioChunks.chunks, segments);
      if (combinedSegments == null) {
        callback("");
        return;
      }
      socket.data.audioChunks.chunks = newBuffer;
      const chunkText = await transcribeBuffer(combinedSegments, "wav");
      
      callback(chunkText);
    } catch (error) {
      if (error instanceof BackendError) {
        socket.emit("error", { name: error.name, message: error.message, status: error.status } as OutputError);
        return;
      }
      const unknownError = new UnknownError("An unknown error occurred when receiving an audio chunk.");
      socket.emit("error", { name: unknownError.name, message: unknownError.message, status: unknownError.status } as OutputError);
    }
  });
}

const stopRecording = async (socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>) => {
  socket.on("stopRecording", async callback => {
    try {
      if (socket.data.currentConversationId == null)
        throw new AudioChunkSentBeforeStartRecordingError("Send message request sent before conversation ID was set.");

      const userId: number = socket.data.userId;
      const conversationId: number = socket.data.currentConversationId;
      const createdAt: string = new Date().toISOString().substring(0, 23);
      const audioFilePath: string = `${userId}/${conversationId}/${createdAt}.wav`;
      // const audioString = socket.data.audioChunks.chunks.join('');
      // if (audioString == undefined)
      //   throw new AudioNotRecordedError("No audio string present, but recording was sent.");
      // const buffer = Buffer.from(
      //   audioString,
      //   'base64'
      // );
      // const localFilePath = path.join(__dirname, `${socket.data.userId}_temp.wav`);
      // fs.writeFileSync(localFilePath, buffer);
      
      // const messageText: string = await transcribe(localFilePath);
      socket.data.audioChunks = {waveData: null, chunks: null};  // Reset for new recording to be started

      // callback(messageText);

      // TODO: upload to s3

      // fs.unlink(localFilePath, (err) => {
      //   if (err)
      //     throw new DeletedFileDoesNotExistError("Attempted to delete a file that does not exist.");
      // });
      callback("Recording stopped.");
    } catch (error) {
      if (error instanceof BackendError) {
        socket.emit("error", { name: error.name, message: error.message, status: error.status } as OutputError);
        return;
      }
      const unknownError = new UnknownError("An unknown error occurred when stopping the recording.");
      socket.emit("error", { name: unknownError.name, message: unknownError.message, status: unknownError.status } as OutputError);
    }
  });
};

const sendMessage = async (socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>) => {
  socket.on("sendMessage", async (conversationId, messageText, callback) => {
    try {
      if (socket.data.currentConversationId == null)
        throw new AudioChunkSentBeforeStartRecordingError("Send message request sent before conversation ID was set.");

      const userId: number = socket.data.userId;
      const createdAt: string = new Date().toISOString().substring(0, 23);
  
      const conversationExists = await query<CountData>(`SELECT COUNT(*) AS count FROM ${CONVERSATION_TABLE_NAME} WHERE conversation_id = ?`, [conversationId.toString()]);
      if (conversationExists[0].count == 0)
        throw new QueryError("Conversation ID does not exist in database");
  
      await query(`INSERT INTO ${MESSAGE_TABLE_NAME} (conversation_id, user_id, message_text, created_at) VALUES (?, ?, ?, ?)`, [conversationId.toString(), userId.toString(), messageText, createdAt]);
  
      const prevMessages = await query<MessageData>(`SELECT * FROM ${MESSAGE_TABLE_NAME} WHERE conversation_id = ? AND conversation_id IS NOT NULL AND user_id IS NOT NULL AND message_text IS NOT NULL AND message_text <> '' ORDER BY created_at ASC LIMIT 32`, [conversationId.toString()]);
      const languageRows = await query<LanguageData>(`SELECT language FROM ${CONVERSATION_TABLE_NAME} WHERE conversation_id = ?`, [conversationId.toString()]);
      const language = languageRows.length > 0 ? languageRows[0].language : "English";
      const responseText = await botResponse(language, prevMessages, messageText);
      const responseCreatedAt: string = new Date().toISOString().substring(0, 23);


      // ADD AUDIO FILE PATH LOGIC
      const responseAudioFilePath: string = `${BOT_USER_ID}/${conversationId}/${responseCreatedAt}.wav`;



      const messageId = await insertQuery(`INSERT INTO ${MESSAGE_TABLE_NAME} (conversation_id, user_id, message_text, created_at) VALUES (?, ?, ?, ?);`, [conversationId.toString(), BOT_USER_ID, responseText, responseCreatedAt]);
      callback({
        messageId: messageId,
        conversationId: conversationId,
        userId: parseInt(BOT_USER_ID),
        messageText: responseText,
        createdAt: new Date(responseCreatedAt)
      });
    } catch (error) {
      if (error instanceof BackendError) {
        socket.emit("error", { name: error.name, message: error.message, status: error.status } as OutputError);
        return;
      }
      const unknownError = new UnknownError("An unknown error occurred when sending a message.");
      socket.emit("error", { name: unknownError.name, message: unknownError.message, status: unknownError.status } as OutputError);
    }
  });
};

const processFullAudio = async (socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>) => {
  socket.on("processFullAudio", async (conversationId, audio, audioType, callback) => {
    try {
      if (socket.data.currentConversationId == null)
        throw new AudioChunkSentBeforeStartRecordingError("Send message request sent before conversation ID was set.");

      const userId: number = socket.data.userId;
      const inputCreatedAt: string = new Date().toISOString().substring(0, 23);
  
      const conversationExists = await query<CountData>(`SELECT COUNT(*) AS count FROM ${CONVERSATION_TABLE_NAME} WHERE conversation_id = ?`, [conversationId.toString()]);
      if (conversationExists[0].count == 0)
        throw new QueryError("Conversation ID does not exist in database");
      
      const inputText = await transcribeBase64(audio, audioType);

      const inputMessageId = await insertQuery(`INSERT INTO ${MESSAGE_TABLE_NAME} (conversation_id, user_id, message_text, created_at) VALUES (?, ?, ?, ?)`, [conversationId.toString(), userId.toString(), inputText, inputCreatedAt]);

      const inputMessage: OutputMessage = {
        messageId: inputMessageId,
        conversationId: conversationId,
        userId: userId,
        messageText: inputText,
        createdAt: new Date(inputCreatedAt)
      };

      const prevMessages = await query<MessageData>(`SELECT * FROM ${MESSAGE_TABLE_NAME} WHERE conversation_id = ? AND conversation_id IS NOT NULL AND user_id IS NOT NULL AND message_text IS NOT NULL AND message_text <> '' ORDER BY created_at ASC LIMIT 32`, [conversationId.toString()]);
      const languageRows = await query<LanguageData>(`SELECT language FROM ${CONVERSATION_TABLE_NAME} WHERE conversation_id = ?`, [conversationId.toString()]);
      const language = languageRows.length > 0 ? languageRows[0].language : "English";
      const responseText = await botResponse(language, prevMessages, inputText);
      const responseCreatedAt: string = new Date().toISOString().substring(0, 23);


      // ADD AUDIO FILE PATH LOGIC
      const responseAudioFilePath: string = `${BOT_USER_ID}/${conversationId}/${responseCreatedAt}.wav`;



      const outputMessageId = await insertQuery(`INSERT INTO ${MESSAGE_TABLE_NAME} (conversation_id, user_id, message_text, created_at) VALUES (?, ?, ?, ?);`, [conversationId.toString(), BOT_USER_ID, responseText, responseCreatedAt]);
      const outputMessage: OutputMessage = {
        messageId: outputMessageId,
        conversationId: conversationId,
        userId: parseInt(BOT_USER_ID),
        messageText: responseText,
        createdAt: new Date(responseCreatedAt)
      };

      callback({
        inputMessage: inputMessage,
        outputMessage: outputMessage
      });
    } catch (error) {
      if (error instanceof BackendError) {
        socket.emit("error", { name: error.name, message: error.message, status: error.status } as OutputError);
        return;
      }
      const unknownError = new UnknownError("An unknown error occurred when sending a message.");
      socket.emit("error", { name: unknownError.name, message: unknownError.message, status: unknownError.status } as OutputError);
    }
  });
}

const deleteConversation = async (req: Request, res: Response) => {
  const conversationId = req.body.conversationId;
  await query(`DELETE FROM ${CONVERSATION_TABLE_NAME} WHERE conversation_id = ?`, [conversationId.toString()]);
  await query(`DELETE FROM ${MESSAGE_TABLE_NAME} WHERE conversation_id = ?`, [conversationId.toString()]);
  res.status(200).send("Conversation deleted.");
}

export { createConversation, getConversations, retrieveMessages, startRecording, receiveAudioChunk, stopRecording, sendMessage, deleteConversation, processFullAudio };