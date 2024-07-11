import { RowDataPacket } from "mysql2";

type Language = "English" 
              | "Spanish" 
              | "French" 
              | "German" 
              | "Italian"
              | "Mandarin"
              | "Cantonese"
              | "Japanese";

export { Language };


// CLIENT TYPES
interface WaveData {
  sampleRate: number;
  numberChannels: number;
  bytesPerSample: number;
}

interface StartRecordingData {
  conversationId: number;
  waveData: WaveData;
}

interface WaveChunks {
  waveData: WaveData;
  audioChunks: string[];
}

interface InputChunk {
  conversationId: number;
  audioChunk: string;
}

interface OutputMessage {
  messageId: number;
  conversationId: number;
  userId: number;
  messageText: string;
  createdAt: Date;
}

export { WaveData, StartRecordingData, WaveChunks, InputChunk, OutputMessage };


// DATABASE TYPES
interface MessageData extends RowDataPacket {
  message_id: number;
  conversation_id: number;
  user_id: number;
  message_text: string;
  created_at: Date;
  audio_file_path?: string;
}

interface UserData extends RowDataPacket {
  user_id: number;
  username: string;
  password_hash: string;
  email: string;
  created_at: Date;
}

interface LanguageData extends RowDataPacket {
  language: Language;
}

interface CountData extends RowDataPacket {
  count: number;
}

interface IdData extends RowDataPacket {
  id: number;
}

export { MessageData, UserData, LanguageData, CountData, IdData };


// AUTH TYPES
interface TokenData {
  username: string;
}

export { TokenData };


// ERROR TYPE
interface Error {
  name: string;
  message: string;
  status: number;
}

export { Error };