import { MessageData } from "../lib/types.js";
import dotenv from 'dotenv';
dotenv.config();
import OpenAI from "openai";
import { BotResponseError, UnknownError } from "../lib/errors.js";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function botResponse(language: string, prevMessages: MessageData[], message: string): Promise<string> {
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [{ role: "system", content: `You are a friend conversing in ${language}` }];
  prevMessages.forEach(messageObject => {
    const role = messageObject['user_id'] == 1 ? "assistant" : "user";
    messages.push({ role: role, content: messageObject['message_text'] });
  });
  messages.push({ role: "user", content: message });
  try {
    const params: OpenAI.Chat.ChatCompletionCreateParamsNonStreaming = {
      messages: messages,
      model: "gpt-4o",
    }
    const completion = await openai.chat.completions.create(params);
    if (completion.choices[0].message.content == undefined)
      throw new BotResponseError("No response from bot");
    return completion.choices[0].message.content;
  } catch (error) {
    if (!(error instanceof Error)) throw new UnknownError();
    throw new BotResponseError(error.message);
  }
}