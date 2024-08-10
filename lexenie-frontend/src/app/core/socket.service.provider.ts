import { InjectionToken } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { BrowserStorageService } from './storage.service';

export const SOCKET = new InjectionToken<Socket>('SocketToken');

function socketFactory(storageService: BrowserStorageService): Socket {
  const idToken = storageService.get('id_token');
  
  const socket = io("http://localhost:3306", {
    path: '/',
    // reconnection: true,
    autoConnect: false,
    extraHeaders: {
      authorization: `bearer ${idToken}`
    }
  });
  socket.on('connect', () => {
    console.log('Socket connected');
  });

  socket.on('connect_error', (error: any) => {
    console.error('Connection error:', error);
  });

  socket.on('disconnect', (reason: string) => {
    console.warn('Socket disconnected:', reason);
  });

  return socket;
}

export const socketProvider = {
  provide: SOCKET,
  useFactory: socketFactory,
  deps: [BrowserStorageService]
};