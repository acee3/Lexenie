import { InjectionToken } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { BrowserStorageService } from './storage.service';

export const SOCKET = new InjectionToken<Socket>('SocketToken');

function socketFactory(storageService: BrowserStorageService): Socket {
  const idToken = storageService.get('id_token');
  
  const socket = io("http://localhost:3306", {
  // const socket = io("127.0.0.1:3306", {
  // const socket = io("173.63.37.43:3306", {
    // path: '/socket.io',
    reconnection: false,
    autoConnect: false,
    extraHeaders: {
      authorization: `Bearer ${idToken}`
    },
    query: {
      token: idToken
    }
  });

  return socket;
}

export const socketProvider = {
  provide: SOCKET,
  useFactory: socketFactory,
  deps: [BrowserStorageService]
};

export interface ServerError {
  name: string;
  message: string;
  status: number;
}

export function isServerError(obj: any): obj is ServerError {
  return obj.name && obj.message && obj.status;
}