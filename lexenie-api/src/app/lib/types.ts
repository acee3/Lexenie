import { RowDataPacket } from "mysql2";

interface Message extends RowDataPacket {
  message_id: number;
  conversation_id: number;
  user_id: number;
  message_text: string;
  created_at: Date;
}

interface Language extends RowDataPacket {
  language: string;
}

export { Message, Language };