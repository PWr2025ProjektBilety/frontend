import { Component, OnDestroy } from '@angular/core';
import { TicketService } from '../../../services/ticket.service';
import { FormsModule } from '@angular/forms';
import { NgClass, NgIf } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-check-ticket',
  standalone: true,
  templateUrl: './check-ticket.component.html',
  imports: [
    FormsModule,
    NgIf,
    NgClass
  ]
})
export class CheckTicketComponent implements OnDestroy {
  ticketCode = '';
  vehicleId = '';
  resultMessage = '';
  resultType = '';
  private subscription: Subscription | null = null;

  constructor(private ticketService: TicketService) {}

  checkTicket(): void {
    this.resultMessage = '';
    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    this.subscription = this.ticketService.checkTicket(this.ticketCode, this.vehicleId).subscribe({
      next: (isValid) => {
        this.resultMessage = isValid
          ? 'Bilet jest ważny.'
          : 'Bilet jest nieważny.';
        this.resultType = isValid ? 'success' : 'danger';
      },
      error: (err) => {
        this.resultMessage = 'Nie znaleziono biletu lub wystąpił błąd.';
        this.resultType = 'danger';
        console.error(err);
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
