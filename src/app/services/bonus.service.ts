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

  buyTicketWithPoints(ticketId: number, discounted: boolean): Observable<any> {
    const url = '/api/boughttickets/buy-with-points';
    const token = sessionStorage.getItem('jwtToken');
    const params = new HttpParams()
      .set('ticketId', ticketId.toString())
      .set('discounted', discounted.toString());
    console.log('BuyTicketWithPoints - Token present:', !!token);
    console.log('BuyTicketWithPoints - TicketId:', ticketId);
    console.log('BuyTicketWithPoints - Discounted:', discounted);
    console.log('BuyTicketWithPoints - URL:', url);
    return this.http.post<any>(url, {}, {
      params,
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
