import { RowDataPacket } from "mysql2";

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