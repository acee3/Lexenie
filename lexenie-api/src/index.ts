import express, { Request, Response } from 'express';
import mysql, { PoolOptions, RowDataPacket } from 'mysql2';
import { Language, Message } from './lib/types';
import { BackendError, BotResponseError, QueryError, UnknownError } from './lib/errors';
require('dotenv').config();
const { Configuration, OpenAIApi } = require('openai');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const access: PoolOptions = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
};

const pool = mysql.createPool(access);

const promisePool = pool.promise();

const conversation_table_name = process.env.CONVERSATION_TABLE_NAME
const audio_file_table_name = process.env.AUDIO_FILE_TABLE_NAME
const message_table_name = process.env.MESSAGE_TABLE_NAME
const user_table_name = process.env.USER_TABLE_NAME

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

app.post('/retrieve-conversation', async (req: Request, res: Response) => {
    const conversationId = req.body.conversationId;
    try {
        const prevMessages = await query<Message>(`SELECT * FROM ${message_table_name} WHERE conversation_id = ? ORDER BY created_at ASC`, [conversationId]);
        res.status(200).send(prevMessages);
    } catch (error) {
        if (error instanceof BackendError)
            res.status(error.status).send(error.message);
        res.status(500).send("Unknown error with retrieving conversation");
    }
});

app.post('/send-message', async (req, res) => {
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
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

async function botResponse(language: string, prevMessages: Message[], message: string): Promise<string> {
    const messages = [{ role: "system", content: `You are a friend conversing in ${language}` }];
    prevMessages.forEach(messageObject => {
        const role = messageObject['user_id'] == 1 ? "assistant" : "user";
        messages.push({ role: role, content: messageObject['message_text'] });
    });
    messages.push({ role: "user", content: message });
    try {
        const completion = await openai.chat.completions.create({
            messages: messages,
            model: "gpt-4o",
        });
        return completion.choices[0].message.content;
    } catch (error) {
        if (!(error instanceof Error)) throw new UnknownError();
        throw new BotResponseError(error.message);
    }
}

async function query<T extends RowDataPacket>(sql: string, args: string[]): Promise<T[]> {
    try {
        const [rows] = await promisePool.query<T[]>(sql, args);
        return rows;
    } catch (error) {
        if (!(error instanceof Error)) throw new UnknownError();
        throw new QueryError(error.message);
    }
}