import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TicketService } from '../../../services/ticket.service';
import { BuyTicketRequest, PurchasedTicketDTO, Ticket } from '../../../models/ticket.model';
import {FormsModule} from '@angular/forms';
import {NgClass, NgIf } from '@angular/common';

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
export class BuyTicketComponent {
  ticket: Ticket;
  reduced: boolean = false
  message: string | null = null;
  activationDate: string = this.getTodayAsDateString();
  minDate: string = this.getTodayAsDateString();
  maxDate: string = this.getMaxDateString(6);

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private ticketService: TicketService
  ) {
    const navigation = this.router.getCurrentNavigation();
    this.ticket = navigation?.extras.state?.['ticket'];

    if (!this.ticket) {
        this.router.navigate(['/']);
    }
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
    this.router.navigate(['/offer']);
  }

  getTodayAsDateString(): string {
    const today = new Date();
    return today.toISOString().split('T')[0]; // YYYY-MM-DD
  }

  getMaxDateString(months: number): string {
    const date = new Date();
    date.setMonth(date.getMonth() + months);
    return date.toISOString().split('T')[0];
  }

  getActivationDateISO(): string {
    if (!this.activationDate) return '';
    return new Date(this.activationDate + 'T00:00:00Z').toISOString();
  }

  buy() {
    if (!this.ticket) return;

    this.message = null;

    const request: BuyTicketRequest = {
      ticketType: this.ticket.type,
      ticketId: this.ticket.id,
      reduced: this.reduced,
      startTime: this.ticket.type === 'PERIODIC_TICKET' ? this.getActivationDateISO(): null
    };

    this.ticketService.buyTicket(request).subscribe({
      next: (res: PurchasedTicketDTO) => {
        this.message = `Kupiono bilet: kod ${res.code}, cena: ${res.finalPrice} zł`;
        console.log(res)
        console.log(request)
      },
      error: (err) => {
        this.message = 'Kupno biletu nie powiodło się.';
        console.error(err);
        console.log(request)
      }
    });
  }
}
