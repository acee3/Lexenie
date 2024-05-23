import { Message } from "./types";
import { Pool, RowDataPacket } from 'mysql2';
import { BotResponseError, QueryError, UnknownError } from './errors';

// async function botResponse(openai: ,language: string, prevMessages: Message[], message: string): Promise<string> {
//   const messages = [{ role: "system", content: `You are a friend conversing in ${language}` }];
//   prevMessages.forEach(messageObject => {
//       const role = messageObject['user_id'] == 1 ? "assistant" : "user";
//       messages.push({ role: role, content: messageObject['message_text'] });
//   });
//   messages.push({ role: "user", content: message });
//   try {
//       const completion = await openai.chat.completions.create({
//           messages: messages,
//           model: "gpt-4o",
//       });
//       return completion.choices[0].message.content;
//   } catch (error) {
//       if (!(error instanceof Error)) throw new UnknownError();
//       throw new BotResponseError(error.message);
//   }
// }

// async function query<T extends RowDataPacket>(promisePool: Pool, sql: string, args: string[]): Promise<T[]> {
//   try {
//       const [rows] = await promisePool.query<T[]>(sql, args);
//       return rows;
//   } catch (error) {
//       if (!(error instanceof Error)) throw new UnknownError();
//       throw new QueryError(error.message);
//   }
// }

// export { botResponse, query };