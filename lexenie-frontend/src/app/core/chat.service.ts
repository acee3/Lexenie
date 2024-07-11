import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = 'http://localhost:3306';
  constructor(private http: HttpClient) { }
  getMessage() {
    return this.http.get(`${this.apiUrl}/`);
  }
}