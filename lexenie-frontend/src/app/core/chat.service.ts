import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Socket, io } from 'socket.io-client';
import { Observable, Subject } from 'rxjs';
import { ServerError, SOCKET } from './socket.service.provider';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private apiUrl = 'http://localhost:3306/chat';

  constructor(
    private http: HttpClient, 
    @Inject(SOCKET) private socket: Socket
  ) {
    this.socket.on('connect', () => {
      console.log('Socket connected');
      
    });

    this.socket.on('connect_error', (error: any) => {
      console.error('Connection error:', error);
    });

    this.socket.on('disconnect', (reason: string) => {
      console.warn('Socket disconnected:', reason);
    });
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

  disconnectObservable() {
    return new Observable<any>((observer) => {
      this.socket.on('disconnect', (reason: string) => {
        observer.next(reason);
      });
    });
  }

  connect() {
    this.socket.connect();
  }

  isConnected(): boolean {
    return this.socket.connected;
  }

  createConversation(name: string, language: Language) {
    return this.http.post<Conversation>(`${this.apiUrl}/createConversation`, { name: name, language: language });
  }

  deleteConversation(conversationId: number) {
    return this.http.post(`${this.apiUrl}/deleteConversation`, { conversationId: conversationId });
  }

  getConversations() {
    return new Observable<Conversation[]>((observer) => {
      this.socket.emit(
        'getConversations',
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
        'retrieveMessages', conversationId,
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
    this.socket.emit('startRecording', input);
  }

  receiveAudioChunk(audioChunk: string) {
    this.socket.emit('receiveAudioChunk', audioChunk);
  }

  stopRecording() {
    this.socket.emit('stopRecordingSendMessage');
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
        'sendMessage', conversationId, messageText,
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