import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, shareReplay }  from 'rxjs/operators';

interface AuthResult {
  idToken: string;
  expiresIn: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3306';
  constructor(private http: HttpClient) { }

  private setSession(authResult: AuthResult) {
    
  }

  createUser(username: string, password: string, email: string ) {
    
    // TODO: handle status codes
    
    
    const token = this.http.post<AuthResult>(`${this.apiUrl}/createUser`, {username, password, email}).pipe(
      tap(res => this.setSession),
      shareReplay()
    );
  }
}