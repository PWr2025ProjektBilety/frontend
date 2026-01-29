import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, Subject, of } from 'rxjs';

export interface BonusBalance {
  balance: number;
  login: string;
}

@Injectable({
  providedIn: 'root',
})
export class BonusService {
  private apiUrl = '/api/bonuses';
  private pointsUpdated = new Subject<void>();

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('jwtToken') || '';
    return new HttpHeaders().set('Authorization', 'Bearer ' + token);
  }

  getPointsBalance(): Observable<BonusBalance> {
    const token = sessionStorage.getItem('jwtToken');
    if (!token) {
      return of({ balance: 0, login: '' });
    }
    return this.http.get<BonusBalance>(`${this.apiUrl}/balance`, {
      headers: this.getAuthHeaders(),
    });
  }

  buyTicketWithPoints(ticketId: number, ticketType: string, reduced: boolean, startTime?: string): Observable<any> {
    const url = '/api/boughttickets/buy-with-points';
    const token = sessionStorage.getItem('jwtToken');
    
    const payload: any = {
      ticketType,
      reduced,
    };
    
    if (startTime) {
      payload.startTime = startTime;
    }
    
    console.log('BuyTicketWithPoints - Token present:', !!token);
    console.log('BuyTicketWithPoints - TicketId:', ticketId);
    console.log('BuyTicketWithPoints - Payload:', payload);
    console.log('BuyTicketWithPoints - URL:', url);
    
    return this.http.post<any>(url, payload, {
      params: new HttpParams().set('ticketId', ticketId.toString()),
      headers: this.getAuthHeaders(),
    });
  }

  notifyPointsChanged(): void {
    this.pointsUpdated.next();
  }

  getPointsUpdateListener(): Observable<void> {
    return this.pointsUpdated.asObservable();
  }
}
