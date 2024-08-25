import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ServerError } from './backend.types';
import { Socket } from 'ngx-socket-io';
import { API_URL } from '../app.config';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private chatURL = `${API_URL}/chat`;

  constructor(
    private http: HttpClient, 
    private socket: Socket
  ) {
    // socket.on('connect', () => {
    //   console.log('Socket connected');
    // });

    // socket.on('connect_error', (error: any) => {
    //   console.error('Connection error:', error);
    // });

    // socket.on('disconnect', (reason: string) => {
    //   console.warn('Socket disconnected:', reason);
    // });
  }

  connectErrorObservable() {
    return new Observable<any>((observer) => {
      this.socket.on('connect_error', (error: any) => {
        observer.next(error);
      });
    });
  }

  errorObservable() {
    return new Observable<ServerError>((observer) => {
      this.socket.on('error', (error: ServerError) => {
        observer.next(error);
      });
    });
  }

  createConversation(name: string, language: Language) {
    this.http.post(`${this.chatURL}/createConversation`, { name: name, language: language });
  }

  deleteConversation(conversationId: number) {
    this.http.post(`${this.chatURL}/deleteConversation`, { conversationId: conversationId });
  }

  getConversations() {

    return new Observable<Conversation[]>((observer) => {
      this.socket.emit(
        '/chat/getConversations',
        (response: Conversation[]) => {
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
        (response: Message[]) => {
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
        (response: string) => {
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
        (response: Message) => {
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