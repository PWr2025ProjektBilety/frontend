import { Injectable } from '@angular/core';
import {BuyTicketRequest, PurchasedTicketDTO, Ticket} from '../models/ticket.model';
import { Observable } from 'rxjs';
import {HttpClient, HttpHeaders} from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class TicketService {
  private getTicketsUrl = 'http://localhost:8080/api/tickets';
  private buyTicketsUrl = 'http://localhost:8080/api/boughttickets/buy';
  constructor(private http: HttpClient) {}

  getAllTickets(): Observable<Ticket[]> {
    const token = localStorage.getItem('jwtToken') || '';

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.get<Ticket[]>(this.getTicketsUrl, { headers });
  }

  buyTicket(request: BuyTicketRequest): Observable<PurchasedTicketDTO> {
    const token = localStorage.getItem('jwtToken') || '';

    if (!token) {
      // Możesz rzucić błąd lub zwrócić Observable z błędem
      throw new Error('User is not authorized!.');
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.post<PurchasedTicketDTO>(this.buyTicketsUrl, request, { headers });
  }

}
