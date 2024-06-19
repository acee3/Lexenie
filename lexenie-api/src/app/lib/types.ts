import { RowDataPacket } from "mysql2";

// CLIENT TYPES
interface InputMessage {
  conversationId: number;
  messageText: string;
}

interface OutputMessage {
  conversationId: number;
  userId: number;
  messageText: string;
  createdAt: Date;
}

export { InputMessage, OutputMessage };


// DATABASE TYPES
interface MessageData extends RowDataPacket {
  message_id: number;
  conversation_id: number;
  user_id: number;
  message_text: string;
  created_at: Date;
}

interface LanguageData extends RowDataPacket {
  language: string;
}

interface CountData extends RowDataPacket {
  count: number;
}

export { MessageData, LanguageData, CountData };


// ERROR TYPE
interface Error {
  name: string;
  message: string;
  status: number;
}

export { Error };