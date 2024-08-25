import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { JWTInterceptor } from './core/jwt.interceptor';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';

export const API_URL = 'http://localhost:3306';

const config: SocketIoConfig = { url: API_URL, options: {
  reconnection: false
} };

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes), 
    provideClientHydration(),
    provideHttpClient(
      withFetch(),
      withInterceptors([
        JWTInterceptor
      ])
    ),
    importProvidersFrom(SocketIoModule.forRoot(config)),
  ]
};
