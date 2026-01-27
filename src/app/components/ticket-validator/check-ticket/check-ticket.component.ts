import { Component } from '@angular/core';
import { TicketService } from '../../../services/ticket.service';
import { FormsModule } from '@angular/forms';
import { NgClass, NgIf } from '@angular/common';

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
export class CheckTicketComponent {
  ticketCode = '';
  vehicleId = '';
  resultMessage = '';
  resultType = '';

  constructor(private ticketService: TicketService) {}

  checkTicket(): void {
    this.resultMessage = '';
    this.ticketService.checkTicket(this.ticketCode, this.vehicleId).subscribe({
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

}
