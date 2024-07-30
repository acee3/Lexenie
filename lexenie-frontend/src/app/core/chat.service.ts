import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = 'http://localhost:3306';

  constructor(private http: HttpClient, private socket: Socket, private errorSubject: Subject<string>, public errors$: Observable<string>, private connectionSubject: Subject<boolean>, public connected$: Observable<boolean>) {
    const idToken = localStorage.getItem("id_token");

    if (idToken) {
      this.socket = io(this.apiUrl, {
        path: '/chat/',
        reconnection: true,
        autoConnect: false,
        extraHeaders: {
          Authorization: 'Bearer ' + idToken
        }
      });

      this.errors$ = this.setupSocketErrorListeners();
      this.connected$ = this.monitorConnection();
      this.socket.connect();
    }
  }

  private setupSocketErrorListeners(): Observable<string> {
    this.errorSubject = new Subject<string>();

    this.socket.on('error', (error: Error) => {
      this.errorSubject.next('error ' + error);
    });

    this.socket.on('connect_error', (connectionError: Error) => {
      this.errorSubject.next('connect_error ' + connectionError?.message);
    });

    this.socket.on('connect_timeout', (connectionError: Error) => {
      this.errorSubject.next('connect_timeout ' + connectionError?.message);
    });

    this.socket.on('reconnect_error', () => {
      this.errorSubject.next('reconnect_error');
    });

    this.socket.on('reconnect_failed', () => {
      this.errorSubject.next('reconnect_failed');
    });

    return this.errorSubject.asObservable();
  }

  private monitorConnection(): Observable<boolean> {
    this.connectionSubject = new BehaviorSubject<boolean>(false);

    this.socket.on('connect', () => {
      this.connectionSubject.next(true);
    });

    this.socket.on('connection', () => {
      this.connectionSubject.next(true);
    });

    this.socket.on('disconnect', () => {
      this.connectionSubject.next(false);
    });

    this.socket.on('disconnecting', () => {
      this.connectionSubject.next(false);
    });

    return this.connectionSubject.asObservable();
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
        'getConversations',
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
        'retrieveMessages', conversationId,
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
    this.socket.emit('startRecording', input);
  }

  receiveAudioChunk(audioChunk: string) {
    this.socket.emit('receiveAudioChunk', audioChunk);
  }

  stopRecordingSendMessage() {
    this.socket.emit('stopRecordingSendMessage');
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