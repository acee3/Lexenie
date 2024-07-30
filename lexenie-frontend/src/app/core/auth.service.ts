import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, shareReplay } from 'rxjs/operators';
import moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3306';
  constructor(private http: HttpClient) { }

  private setSession(authResult: AuthResult) {
    const expiresAt = moment().add(authResult.expiresIn, 'second');

    localStorage.setItem('id_token', authResult.idToken);
    localStorage.setItem("expires_at", JSON.stringify(expiresAt.valueOf()));
  }

  createUser(username: string, password: string, email: string) {

    // TODO: handle status codes


    const token = this.http.post<AuthResult>(`${this.apiUrl}/createUser`, { username, password, email }).pipe(
      tap(res => this.setSession),
      shareReplay()
    );
  }

  login(email: string, password: string) { 
    const token = this.http.post<AuthResult>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap(res => this.setSession),
      shareReplay()
    );
  }

  logout() {
    localStorage.removeItem("id_token");
    localStorage.removeItem("expires_at");
  }

  isLoggedIn() {
    return moment().isBefore(this.getExpiration());
  }

  isLoggedOut() {
    return !this.isLoggedIn();
  }

  getExpiration() {
    const expiration = localStorage.getItem("expires_at");
    if (expiration) {
      const expiresAt = JSON.parse(expiration);
      return moment(expiresAt);
    } else {
      return moment();
    }
  }
}

interface AuthResult {
  idToken: string;
  expiresIn: number;
}
