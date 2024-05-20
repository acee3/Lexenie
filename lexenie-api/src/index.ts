import express, { Request, Response } from 'express';
import mysql, { PoolOptions, RowDataPacket } from 'mysql2';
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
        const [conversation] = await promisePool.query<RowDataPacket[]>(`SELECT * FROM ${message_table_name} WHERE conversation_id = ? ORDER BY created_at ASC`, [conversationId]);
        res.status(200).send(conversation);
    } catch (error) {
        res.status(400).send("Error retrieving conversation");
    }
});

app.post('/send-message', async (req, res) => {
    const conversationId = req.body.conversationId;
    const userId = req.body.userId;
    const messageText = req.body.messaggeText;
    const createdAt = req.body.createdAt;
    try {
        const [prevMessages] = await promisePool.query(``);
        const [languageRows] = await promisePool.query(``);
        const language = languageRows.length > 0 ? languageRows
        const responseText = await botResponse();
    } catch (error) {
        res.status(400).send("Error sending message");
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

async function botResponse(language: string, prevMessages: Message[], message: string) {
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
        return error;
    }
}