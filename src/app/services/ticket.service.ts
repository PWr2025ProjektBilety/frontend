import { Injectable } from '@angular/core';
import {BuyTicketRequest, PurchasedTicketDTO, Ticket, TicketValidationRequest} from '../models/ticket.model';
import { Observable } from 'rxjs';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {Page} from '../models/page.model';

@Injectable({
  providedIn: 'root',
})
export class TicketService {
  private readonly BASE_URL = 'http://localhost:8080/api';
  private readonly TICKETS_URL = `${this.BASE_URL}/tickets`;
  private readonly PURCHASED_URL = `${this.BASE_URL}/boughttickets`;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('jwtToken') || '';
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  getAllTickets(): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(this.TICKETS_URL, {
      headers: this.getAuthHeaders(),
    });
  }

  buyTicket(request: BuyTicketRequest): Observable<PurchasedTicketDTO> {
    return this.http.post<PurchasedTicketDTO>(
      `${this.PURCHASED_URL}/buy`,
      request,
      { headers: this.getAuthHeaders() }
    );
  }

  getTicketHistory(page: number, size: number): Observable<Page<PurchasedTicketDTO>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<Page<PurchasedTicketDTO>>(
      `${this.PURCHASED_URL}/history`,
      {
        headers: this.getAuthHeaders(),
        params,
      }
    );
  }

  validateTicket(ticketId: string, vehicleId: string): Observable<string> {
    const request: TicketValidationRequest = { ticketId, vehicleId };

    const headers = this.getAuthHeaders().set('Content-Type', 'application/json');

    return this.http.post<string>(
      `${this.PURCHASED_URL}/validate`,
      request,
      {
        headers,
        responseType: 'text' as 'json',
      }
    );
  }
}
