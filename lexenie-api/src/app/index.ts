import express from 'express';
import getChatRouter from './routes/chatRoutes.js';
import Database from './setup/databaseSetup.js';
import botResponse from './setup/botSetup.js';
import createWebsocket from './setup/websocket.js';
import { createServer } from 'http';
import cors from 'cors';
import session from 'express-session';

import { CountData } from './lib/types.js';

const app = express();

const db: Database = new Database();
const { query, CONVERSATION_TABLE_NAME, MESSAGE_TABLE_NAME, USER_TABLE_NAME, BOT_USER_ID } = db;
await query<CountData>('SELECT 1', []);  // Test connection and continue pool

const httpServer = createServer(app);
const io = await createWebsocket(httpServer);

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(cors());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

const chatRouter = await getChatRouter();
app.use('/', chatRouter);

export { io, botResponse, query, CONVERSATION_TABLE_NAME, MESSAGE_TABLE_NAME, USER_TABLE_NAME, BOT_USER_ID };
export default httpServer;