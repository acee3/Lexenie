import { MessageData } from "../lib/types.js";
import dotenv from 'dotenv';
dotenv.config();
import OpenAI from "openai";
import { BotResponseError, UnknownError } from "../lib/errors.js";
import fs, { mkdtempSync, ReadStream, writeFileSync } from 'fs';
import { tmpdir } from "os";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const hostedModelURL = "http://localhost:5000";

async function botResponse(language: string, prevMessages: MessageData[], message: string): Promise<string> {
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [{ role: "system", content: `You are a friend conversing in ${language}` }];
  prevMessages.forEach(messageObject => {
    const role = messageObject['user_id'] == 1 ? "assistant" : "user";
    messages.push({ role: role, content: messageObject['message_text'] });
  });
  messages.push({ role: "user", content: message });
  try {
    const params: OpenAI.Chat.ChatCompletionCreateParamsNonStreaming = {
      messages: messages,
      model: "gpt-3.5-turbo-0125",
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

async function transcribe(filepath: string) {
  const transcription = await openai.audio.transcriptions.create({
    file: fs.createReadStream(filepath),
    model: "whisper-1",
  });
  return transcription.text;
}

function base64ToReadStream(base64: string, filename: string): ReadStream {
  const matches = base64.match(/^data:(.+);base64,(.+)$/);
  if (!matches) {
    throw new Error('Invalid Data URI format');
  }
  const base64Data = matches[2];
  const binaryBuffer = Buffer.from(base64Data, 'base64');
  
  const tmpDir = tmpdir();
  const audioDir = mkdtempSync(tmpDir);
  const audioPath = audioDir + filename;
  writeFileSync(audioPath, binaryBuffer);

  return fs.createReadStream(audioPath);
}

async function transcribeBase64(base64: string, extension: string) {
  const stream = base64ToReadStream(base64, `recording_${Date.now()}.${extension}`);
  try {
    const transcription = await openai.audio.transcriptions.create({
      file: stream,
      model: "whisper-1",
    });
    return transcription.text;
  } catch (error) {
    if (!(error instanceof Error)) throw new UnknownError();
    throw new BotResponseError(error.message);
  }
}

async function segmentAudioBase64(base64: string, sampleRate: number) {
  try {
    const response = await fetch(`${hostedModelURL}/segment`, {
      method: "POST",
      body: JSON.stringify({ audio: base64, sample_rate: sampleRate }),
    });
    const json = (await response.json()) as { segments: string[] };
    return json.segments;
  } catch (error) {
    if (!(error instanceof Error)) throw new UnknownError();
    throw new BotResponseError(error.message);
  }
}

export { botResponse, transcribe, transcribeBase64, segmentAudioBase64 }