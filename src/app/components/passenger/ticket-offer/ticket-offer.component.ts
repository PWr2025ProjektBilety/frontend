import { Component, OnInit } from '@angular/core';
import { TicketService } from '../../../services/ticket.service';
import { Ticket } from '../../../models/ticket.model';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-ticket-offer',
  templateUrl: './ticket-offer.component.html',
  standalone: true,
  imports: [HttpClientModule, CommonModule],
})
export class TicketOfferComponent implements OnInit {
  tickets: Ticket[] = [];
  singleRideTickets: Ticket[] = [];
  timeBasedTickets: Ticket[] = [];
  periodicTickets: Ticket[] = [];

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.data.subscribe({
      next: (data) => {
        this.tickets = data['ticketData'] || [];
        this.singleRideTickets = this.tickets.filter(t => t.type === 'SINGLE_RIDE_TICKET');
        this.timeBasedTickets = this.tickets.filter(t => t.type === 'TIME_BASED_TICKET');
        this.periodicTickets = this.tickets.filter(t => t.type === 'PERIODIC_TICKET');
      },
      error: (err) => {
        console.error('Błąd przy pobieraniu biletów z resolvera', err);
      },
    });
  }


  goToBuyTicket(ticket: Ticket) {
    sessionStorage.setItem('selectedTicket', JSON.stringify(ticket));
    this.router.navigate(['/buy-ticket'], { state: { ticket } });
  }

}
