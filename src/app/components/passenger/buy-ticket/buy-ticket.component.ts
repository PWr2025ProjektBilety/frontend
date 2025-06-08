import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TicketService } from '../../../services/ticket.service';
import { BuyTicketRequest, PurchasedTicketDTO, Ticket } from '../../../models/ticket.model';
import {FormsModule} from '@angular/forms';
import {NgClass, NgIf, TitleCasePipe} from '@angular/common';
import {routes} from '../../../app.routes';

@Component({
  selector: 'app-buy-ticket',
  templateUrl: './buy-ticket.component.html',
  standalone: true,
  imports: [
    FormsModule,
    NgIf,
    NgClass
  ],
  styleUrls: ['./buy-ticket.component.scss']
})
export class BuyTicketComponent implements OnInit {
  ticket?: Ticket;
  reduced: boolean = false
  message: string | null = null;
  isLoading: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private ticketService: TicketService
  ) {
    const navigation = this.router.getCurrentNavigation();
    this.ticket = navigation?.extras.state?.['ticket'];

    if (!this.ticket) {
      const storedTicket = localStorage.getItem('selectedTicket');
      if (storedTicket) {
        this.ticket = JSON.parse(storedTicket);
      } else {
        alert('Brak danych biletu. Wracam do listy...');
        this.router.navigate(['/']);
      }
    }
  }

  ngOnInit() {

  }

  buy() {
    if (!this.ticket) return;

    this.isLoading = true;
    this.message = null;

    const request: BuyTicketRequest = {
      ticketType: this.ticket.type,
      ticketId: this.ticket.id,
      reduced: this.reduced,
      startTime: this.ticket.type === 'PERIODIC_TICKET' ? new Date().toISOString() : null
    };

    this.ticketService.buyTicket(request).subscribe({
      next: (res: PurchasedTicketDTO) => {
        this.message = `Kupiono bilet: kod ${res.code}, cena: ${res.finalPrice} zł`;
        this.isLoading = false;
        console.log(res)
      },
      error: (err) => {
        this.message = 'Kupno biletu nie powiodło się.';
        console.error(err);
        this.isLoading = false;
        console.log(request)
      }
    });
  }

  cancel() {
    this.router.navigate(['/offer']);
  }

  getTicketTypePolish(type: string): string {
    switch(type) {
      case 'SINGLE_RIDE_TICKET': return 'Bilet jednorazowy';
      case 'TIME_BASED_TICKET': return 'Bilet czasowy';
      case 'PERIODIC_TICKET': return 'Bilet okresowy';
      default: return 'Nieznany typ biletu';
    }
  }

  closePopup() {
    this.message = null;
    this.router.navigate(['/']);
  }

}
