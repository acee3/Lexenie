import { RowDataPacket } from "mysql2";

// GENERAL TYPES
type Language = "English" 
              | "Spanish" 
              | "French" 
              | "German" 
              | "Italian"
              | "Mandarin"
              | "Cantonese"
              | "Japanese";

type Option<T> = T | null;

export { Language, Option };


// CLIENT TYPES
interface WaveData {
  sampleRate: Option<number>;
  numberChannels: Option<number>;
  bytesPerSample: Option<number>;
}

interface StartRecordingData {
  conversationId: number;
  waveData: WaveData;
}

interface WaveChunks {
  waveData: WaveData;
  chunks: string[];
}

interface OutputConversation {
  conversationId: number;
  name: string;
  lastTime: Date;
}

interface OutputMessage {
  messageId: number;
  conversationId: number;
  userId: number;
  messageText: string;
  createdAt: Date;
}

export { WaveData, StartRecordingData, WaveChunks, OutputConversation, OutputMessage };


// DATABASE TYPES
interface ConversationData extends RowDataPacket {
  conversation_id: number,
  name: string
}

interface MessageData extends RowDataPacket {
  message_id: number;
  conversation_id: number;
  user_id: number;
  message_text: string;
  created_at: Date;
  is_complete: boolean;
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

export { ConversationData, MessageData, UserData, LanguageData, CountData, IdData };


// AUTH TYPES
interface TokenData {
  username: string;
}

export { TokenData };


// ERROR TYPE
interface OutputError {
  name: string;
  message: string;
  status: number;
}

export { OutputError };