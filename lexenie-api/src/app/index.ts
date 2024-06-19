import express from 'express';
import chatRouter from './routes/chatRoutes.js';
import Database from './setup/databaseSetup.js';
import botResponse from './setup/botSetup.js';
import Websocket from './setup/websocket.js';
import { createServer } from 'http';
import cors from 'cors';
import { CountData } from './lib/types.js';

const app = express();

const db: Database = new Database();
const { query, CONVERSATION_TABLE_NAME, AUDIO_FILE_TABLE_NAME, MESSAGE_TABLE_NAME, USER_TABLE_NAME, BOT_USER_ID } = db;
await query<CountData>('SELECT 1', []);  // Test connection and continue pool

app.use(cors());
app.use(express.json()); 
app.use('/', chatRouter);

const httpServer = createServer(app);
const io = Websocket.getInstance(httpServer);

export { io, botResponse, query, CONVERSATION_TABLE_NAME, AUDIO_FILE_TABLE_NAME, MESSAGE_TABLE_NAME, USER_TABLE_NAME, BOT_USER_ID };
export default httpServer;