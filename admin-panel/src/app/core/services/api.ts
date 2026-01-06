import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private adminUrl = 'http://localhost:3000';
  private bookingUrl = 'http://localhost:4017';

  constructor(private http: HttpClient) { }


  adminPost(endpoint: string, data: any): Observable<any> {
    return this.http.post(`${this.adminUrl}/${endpoint}`, data);
  }

  bookingPost(endpoint: string, data: any): Observable<any> {
    return this.http.post(`${this.bookingUrl}/${endpoint}`, data);
  }
}