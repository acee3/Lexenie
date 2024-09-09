import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, shareReplay, catchError } from 'rxjs/operators';
import moment from 'moment';
import { BrowserStorageService } from './storage.service';
import { isServerError, ServerError } from './socket.service.provider';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3306/auth';
  constructor(private storageService: BrowserStorageService, private http: HttpClient) { }

  private setSession(authResult: AuthResult) {
    const expiresAt = moment().add(authResult.expiresIn, 'second');
    this.storageService.set('id_token', authResult.idToken);
    this.storageService.set("expires_at", JSON.stringify(expiresAt.valueOf()));
    this.storageService.set("user_id", authResult.userId.toString());
  }

  createUser(username: string, password: string, email: string) {
    return this.http.post<AuthResult>(`${this.apiUrl}/createUser`, { username, password, email }).pipe(
      tap(result => this.setSession(result)),
      shareReplay(),
      catchError<AuthResult, never>((err, _) => {
        if (err.error != undefined && isServerError(err.error)) {
          throw err;
        }
        if (typeof err === 'string')
          throw new Error(err);
        throw new Error("Unknown error with creating user.");
      })
    )
  }

  login(email: string, password: string) { 
    return this.http.post<AuthResult>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap(result => this.setSession(result)),
      shareReplay(),
      catchError<AuthResult, never>((err, _) => {
        if (err.error != undefined && isServerError(err.error)) {
          throw err;
        }
        if (typeof err === 'string')
          throw new Error(err);
        throw new Error("Unknown error with logging in user.");
      })
    );
  }

  logout() {
    this.storageService.remove("id_token");
    this.storageService.remove("expires_at");
  }

  isLoggedIn() {
    return moment().isBefore(this.getExpiration());
  }

  isLoggedOut() {
    return !this.isLoggedIn();
  }

  getExpiration() {
    const expiration = this.storageService.get("expires_at");
    if (expiration) {
      const expiresAt = JSON.parse(expiration);
      return moment(expiresAt);
    } else {
      return moment();
    }
  }

  getUserId() {
    const userId = this.storageService.get("user_id");
    if (userId) {
      return parseInt(userId);
    } else {
      return -1;
    }
  }
}

interface AuthResult {
  idToken: string;
  expiresIn: number;
  userId: number;
}
