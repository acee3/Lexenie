import OpenAI from "openai";

require('dotenv').config();
const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

const conversation_table_name = process.env.CONVERSATION_TABLE_NAME
const audio_file_table_name = process.env.AUDIO_FILE_TABLE_NAME
const message_table_name = process.env.MESSAGE_TABLE_NAME
const user_table_name = process.env.USER_TABLE_NAME

const openai = new OpenAI();
openai.apiKey = process.env.OPENAI_API_KEY;

app.post('/retrieve-conversation', async (req, res) => {
    const conversationId = req.body.conversationId;
    const conversation = await query(`SELECT * FROM ${message_table_name} WHERE conversation_id = ${conversationId} ORDER BY created_at ASC;`)
    res.status(200).send(conversation);
});

app.post('/send-message', async (req, res) => {
    const conversationId = req.body.conversationId;
    const userId = req.body.userId;
    const messageText = req.body.messaggeText;
    const createdAt = req.body.createdAt;
    try {
        const dbResult = await query(``);
        const responseText = await botResponse();
    } catch(error) {
        res.status(400).send(error);
    }
});

const PORT = process.env.PORT || 3306;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

async function botResponse(language, prevMessages, message) {
    try {
        const messages = [{role: "system", content: `You are a friend conversing in ${language}`}];
        prevMessages.forEach(messageObject => {
            const role = messageObject['user_id'] == 1 ? "assistant" : "user";
            messages.push({role: role, content: messageObject['message_text']});
        });
        messages.push({role: "user", content: message});

        const completion = await openai.chat.completions.create({
            messages: messages,
            model: "gpt-4o",
        });

        return {success: true, response: completion.choices[0].message.content};
    } catch(error) {
        return {success: false, response: ""};
    }
}

async function query(queryString) {
    return new Promise((resolve, reject) => {
        db.query(queryString, (err, result) => {
            if (err) return reject(err);
            return resolve(result);
        });
    });
}