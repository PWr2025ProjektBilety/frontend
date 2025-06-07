import { Component, OnDestroy, OnInit } from '@angular/core';
import { TicketService } from '../../../services/ticket.service';
import { Ticket } from '../../../models/ticket.model';
import { Subscription } from 'rxjs';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import {Router, RouterLink} from '@angular/router';

@Component({
  selector: 'app-ticket-offer',
  templateUrl: './ticket-offer.component.html',
  standalone: true,
  imports: [HttpClientModule, CommonModule],
})
export class TicketOfferComponent implements OnInit, OnDestroy {
  tickets: Ticket[] = [];
  isLoading = true;
  message: string | null = null;

  singleRideTickets: Ticket[] = [];
  timeBasedTickets: Ticket[] = [];
  periodicTickets: Ticket[] = [];

  private ticketSub: Subscription | undefined;

  constructor(private ticketService: TicketService, private router: Router) {}

  ngOnInit(): void {
    this.ticketSub = this.ticketService.getAllTickets().subscribe({
      next: (data) => {
        this.tickets = data;

        // Podział biletów na typy
        this.singleRideTickets = this.tickets.filter(t => t.type === 'SINGLE_RIDE_TICKET');
        this.timeBasedTickets = this.tickets.filter(t => t.type === 'TIME_BASED_TICKET');
        this.periodicTickets = this.tickets.filter(t => t.type === 'PERIODIC_TICKET');

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Błąd przy pobieraniu biletów', err);
        this.isLoading = false;
      },
    });
  }

  goToBuyTicket(ticket: Ticket) {
    localStorage.setItem('selectedTicket', JSON.stringify(ticket));
    this.router.navigate(['/buy-ticket', { state: { ticket } }]);
  }

  ngOnDestroy(): void {
    this.ticketSub?.unsubscribe();
  }
}
