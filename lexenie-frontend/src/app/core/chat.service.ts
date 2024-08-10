import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Socket, io } from 'socket.io-client';
import { Observable, Subject } from 'rxjs';
import { SOCKET } from './socket.service.provider';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private apiUrl = 'http://localhost:3306/chat';

  constructor(
    private http: HttpClient, 
    @Inject(SOCKET) private socket: Socket
  ) {
    this.socket.connect();
  }

  isConnected(): boolean {
    return this.socket.connected;
  }

  createConversation(name: string, language: Language) {
    this.http.post(`${this.apiUrl}/createConversation`, { name: name, language: language });
  }

  deleteConversation(conversationId: number) {
    this.http.post(`${this.apiUrl}/deleteConversation`, { conversationId: conversationId });
  }

  getConversations() {
    return new Observable<Conversation[]>((observer) => {
      this.socket.emit(
        '/chat/getConversations',
        (response: ServerError | Conversation[]) => {
          if (isServerError(response)) {
            observer.error(response);
            return;
          }
          observer.next(response);
          observer.complete();
        }
      );
    });
  }

  retrieveMessages(conversationId: number) {
    return new Observable<Message[]>((observer) => {
      this.socket.emit(
        '/chat/retrieveMessages', conversationId,
        (response: ServerError | Message[]) => {
          if (isServerError(response)) {
            observer.error(response);
            return;
          }
          observer.next(response);
          observer.complete();
        }
      );
    });
  }
  
  startRecording(input: StartRecordingData) {
    this.socket.emit('/chat/startRecording', input);
  }

  receiveAudioChunk(audioChunk: string) {
    this.socket.emit('/chat/receiveAudioChunk', audioChunk);
  }

  stopRecording() {
    this.socket.emit('/chat/stopRecordingSendMessage');
    return new Observable<string>((observer) => {
      this.socket.emit(
        'stopRecording',
        (response: ServerError | string) => {
          if (isServerError(response)) {
            observer.error(response);
            return;
          }
          observer.next(response);
          observer.complete();
        }
      );
    });
  }

  sendMessage(conversationId: number, messageText: string) {
    return new Observable<Message>((observer) => {
      this.socket.emit(
        '/chat/sendMessage', conversationId, messageText,
        (response: ServerError | Message) => {
          if (isServerError(response)) {
            observer.error(response);
            return;
          }
          observer.next(response);
          observer.complete();
        }
      );
    });
  }
}


export type Language = "English"
  | "Spanish"
  | "French"
  | "German"
  | "Italian"
  | "Mandarin"
  | "Cantonese"
  | "Japanese";

export interface Message {
  messageId: number;
  conversationId: number;
  userId: number;
  messageText: string;
  createdAt: Date;
}

export interface Conversation {
  conversationId: number;
  name: string;
  lastTime: Date;
}

export interface ServerError {
  name: string;
  message: string;
  status: number;
}

function isServerError(response: any): response is ServerError {
  return (response as ServerError).name !== undefined &&
         (response as ServerError).message !== undefined &&
         (response as ServerError).status !== undefined;
}

export type Option<T> = T | null;

export interface WaveData {
  sampleRate: Option<number>;
  numberChannels: Option<number>;
  bytesPerSample: Option<number>;
}

export interface StartRecordingData {
  conversationId: number;
  waveData: WaveData;
}