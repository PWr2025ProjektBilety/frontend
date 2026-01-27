import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';

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
    return this.http.get<BonusBalance>(`${this.apiUrl}/balance`, {
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
