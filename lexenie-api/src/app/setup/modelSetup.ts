import { MessageData, WaveData } from "../lib/types.js";
import dotenv from 'dotenv';
dotenv.config();
import OpenAI from "openai";
import { BotResponseError, UnknownError } from "../lib/errors.js";
import fs, { mkdtempSync, ReadStream, writeFileSync } from 'fs';
import { tmpdir } from "os";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const hostedModelURL = "http://127.0.0.1:5000";

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


/* Converts a base64 string to a ReadStream
 * Handles both base64 strings with and without "data:" prefix
 * @param base64 The base64 string to convert
 * @param filename The filename to save the base64 string as
 * @returns A ReadStream of the base64 string
 */
function base64ToReadStream(base64: string, filename: string): ReadStream {
  const matches = base64.match(/^data:(.+);base64,(.+)$/);
  if (matches)
    base64 = matches[2];

  const binaryBuffer = Buffer.from(base64, 'base64');
  
  const tmpDir = tmpdir();
  const audioDir = mkdtempSync(tmpDir);
  const audioPath = audioDir + filename;
  writeFileSync(audioPath, binaryBuffer);

  return fs.createReadStream(audioPath);
}

async function transcribeBase64(base64: string, extension: string) {
  try {
    const stream = base64ToReadStream(base64, `recording_${Date.now()}.${extension}`);
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

async function segmentAudioBase64(base64: string, waveData: WaveData) {
  try {
    const response = await fetch(`${hostedModelURL}/vad-segment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        "audio": base64, 
        "sample_rate": waveData.sampleRate,
        "nchannels": waveData.numberChannels,
        "sampwidth": waveData.bytesPerSample,
      }),
    });
    const json = (await response.json()) as { segments: string[] };
    return json.segments;
  } catch (error) {
    if (!(error instanceof Error)) throw new UnknownError();
    throw new BotResponseError(error.message);
  }
}

function combineAudioBase64(segments: string[]) {
  if (segments.length == 0)
    throw new BotResponseError("No audio segments to combine");
  
  // Remove the wav file headers from every segment except first to prevent duplicates RIFFs
  segments = segments.map((segment, idx) => idx == 0 ? segment : segment.substring(4));
  
  return segments.join("");
}

export { botResponse, transcribe, transcribeBase64, segmentAudioBase64, combineAudioBase64 }