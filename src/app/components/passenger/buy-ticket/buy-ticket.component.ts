import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TicketService } from '../../../services/ticket.service';
import { BonusService } from '../../../services/bonus.service';
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
export class BuyTicketComponent implements OnInit {
  ticket: Ticket;
  reduced: boolean = false
  message: string | null = null;
  activationDate: string = this.getTodayAsDateString();
  minDate: string = this.getTodayAsDateString();
  maxDate: string = this.getMaxDateString(6);
  userPoints: number = 0;

  constructor(
    private router: Router,
    private ticketService: TicketService,
    private bonusService: BonusService
  ) {
    const navigation = this.router.getCurrentNavigation();
    this.ticket = navigation?.extras.state?.['ticket'];

    if (!this.ticket) {
        this.router.navigate(['/']);
    }
  }

  ngOnInit(): void {
    this.bonusService.getPointsBalance().subscribe({
      next: (data) => {
        this.userPoints = data.balance;
      },
      error: (err) => {
        console.error('Error fetching points balance:', err);
        this.userPoints = 0;
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

  calculatePointsCost(): number {
    if (!this.ticket) return 0;
    const basePrice = this.ticket.price;
    const discountMultiplier = this.reduced ? 0.5 : 1;
    return Math.round(basePrice * discountMultiplier * 100);
  }

  onBuyWithPoints(): void {
    if (!this.ticket) return;

    this.message = null;

    this.bonusService.buyTicketWithPoints(
      this.ticket.id,
      this.reduced
    ).subscribe({
      next: (res) => {
        this.message = `Kupiono bilet za punkty: kod ${res.code}`;
        console.log(res);
        this.bonusService.notifyPointsChanged();
      },
      error: (err) => {
        if (err.status === 402) {
          this.message = 'Niewystarczająco punktów. Potrzebujesz ' + this.calculatePointsCost() + ' pkt.';
        } else if (err.status === 500) {
          this.message = 'Błąd serwera: ' + (err.error?.error || 'Spróbuj ponownie.');
          console.error('Server error:', err);
        } else {
          this.message = 'Kupno biletu za punkty nie powiodło się.';
        }
        console.error(err);
      }
    });
  }
}
