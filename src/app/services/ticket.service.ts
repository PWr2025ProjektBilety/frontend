import { Injectable } from '@angular/core';
import {BuyTicketRequest, PurchasedTicketDTO, Ticket, TicketValidationRequest} from '../models/ticket.model';
import { Observable } from 'rxjs';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {Page} from '../models/page.model';

@Injectable({
  providedIn: 'root',
})
export class TicketService {
  private readonly BASE_URL = '/api';
  private readonly TICKETS_URL = `${this.BASE_URL}/tickets`;
  private readonly PURCHASED_URL = `${this.BASE_URL}/boughttickets`;
  private readonly INSPECTION_URL = `${this.BASE_URL}/ticket-inspection`;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('jwtToken') || '';
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

  checkTicket(ticketCode: string, vehicleId: string): Observable<boolean> {
    const headers = this.getAuthHeaders().set('Content-Type', 'application/json');

    const body = { ticketCode: ticketCode.trim(), vehicleId: vehicleId.trim() };

    return this.http.post<boolean>(this.INSPECTION_URL, body, { headers });
  }

  getAllTicketsForAdmin(): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(`${this.TICKETS_URL}/all`, {
      headers: this.getAuthHeaders(), // <-- TO MUSI TU BYĆ
    });
  }

  createTicket(ticket: Ticket): Observable<Ticket> {
    return this.http.post<Ticket>(this.TICKETS_URL, ticket, {
      headers: this.getAuthHeaders(),
    });
  }

  deleteTicket(id: number): Observable<void> {
    return this.http.delete<void>(`${this.TICKETS_URL}/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }

}
