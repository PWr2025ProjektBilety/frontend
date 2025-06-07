import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { Ticket } from '../models/ticket.model';
import { TicketService } from '../services/ticket.service';

@Injectable({
  providedIn: 'root'
})
export class TicketResolver implements Resolve<Ticket[]> {
  constructor(private ticketService: TicketService) {}

  resolve(): Observable<Ticket[]> {
    return this.ticketService.getAllTickets();
  }
}
