import mysql, { PoolOptions, RowDataPacket } from "mysql2";
import { UnknownError, BotResponseError, QueryError } from "./lib/errors";
import { Message } from "./lib/types";
require('dotenv').config();
const { OpenAI } = require('openai');

export const setup = () => {
  const access: PoolOptions = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  };
  const pool = mysql.createPool(access);
  const promisePool = pool.promise();

  const openai = new OpenAI({ key: process.env.OPENAI_API_KEY });

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

  return { botResponse, query };
}