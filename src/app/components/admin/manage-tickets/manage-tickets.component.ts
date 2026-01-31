import { Component, OnInit } from '@angular/core';
import { TicketService } from '../../../services/ticket.service';
import { Ticket, TicketType } from '../../../models/ticket.model';
import { FormsModule } from '@angular/forms';
import { NgClass, NgIf, NgFor, CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-manage-tickets',
  templateUrl: './manage-tickets.component.html',
  standalone: true,
  imports: [NgClass, NgIf, NgFor, FormsModule, CurrencyPipe],
  styleUrls: ['./manage-tickets.component.scss']
})
export class ManageTicketsComponent implements OnInit {
  tickets: Ticket[] = [];

  newTicket: any = this.getDefaultTicket();

  successMessage = '';
  errorMessage = '';

  constructor(private ticketService: TicketService) {}

  ngOnInit(): void {
    this.loadTickets();
  }

  loadTickets(): void {
    this.ticketService.getAllTicketsForAdmin().subscribe({
      next: (data) => {
        this.tickets = data.sort((a, b) => a.id - b.id);
      },
      error: () => this.errorMessage = 'Błąd podczas pobierania ofert.'
    });
  }

  // Funkcja ładująca dane do formularza (edycja)
  editTicket(ticket: Ticket): void {
    this.newTicket = { ...ticket };
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Przewiń do formularza
  }

  toggleActive(ticket: Ticket): void {
    if (ticket.active) {

      if (confirm('Czy na pewno chcesz ukryć ten bilet?')) {
        this.ticketService.deleteTicket(ticket.id).subscribe({
          next: () => {
            this.successMessage = 'Bilet został ukryty.';
            this.loadTickets();
            setTimeout(() => this.successMessage = '', 3000);
          },
          error: () => this.errorMessage = 'Błąd przy wyłączaniu.'
        });
      }
    } else {
      const activatedTicket = { ...ticket, active: true };
      this.ticketService.createTicket(activatedTicket).subscribe({
        next: () => {
          this.successMessage = 'Bilet jest ponownie widoczny!';
          this.loadTickets();
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: () => this.errorMessage = 'Błąd przy uaktywnianiu.'
      });
    }
  }

  onCreateTicket(): void {
    this.errorMessage = '';

    if (!this.validateTicket()) return;

    const ticketToSave = { ...this.newTicket };
    if (ticketToSave.id === 0) delete ticketToSave.id;

    this.ticketService.createTicket(ticketToSave).subscribe({
      next: () => {
        this.successMessage = this.newTicket.id === 0 ? 'Dodano nowy bilet!' : 'Zaktualizowano bilet!';
        this.loadTickets();
        this.resetForm();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: () => this.errorMessage = 'Błąd podczas zapisu biletu.'
    });
  }

  private validateTicket(): boolean {
    // Walidacja ceny
    if (this.newTicket.price <= 0) {
      this.errorMessage = 'Cena musi być większa niż 0.';
      return false;
    }
    if (this.newTicket.price > 9999) {
      this.errorMessage = 'Maksymalna cena to 9999 PLN.';
      return false;
    }

    // Walidacja ważności (tylko dla biletów które nie są jednorazowe)
    if (this.newTicket.type !== 'SINGLE_RIDE_TICKET') {
      if (!this.newTicket.validityPeriod || this.newTicket.validityPeriod <= 0) {
        this.errorMessage = 'Ważność musi być większa niż 0.';
        return false;
      }
      if (this.newTicket.validityPeriod > 999) {
        this.errorMessage = 'Maksymalna ważność to 999.';
        return false;
      }
    }
    return true;
  }


  resetForm() {
    this.newTicket = this.getDefaultTicket();
  }

  private getDefaultTicket() {
    return { id: 0, price: 0, discountAvailable: false, active: true, type: TicketType.TIME_BASED_TICKET, validityPeriod: 0 };
  }

  get activeTicketsCount(): number {
    return this.tickets.filter(t => t.active).length;
  }

  get hiddenTicketsCount(): number {
    return this.tickets.filter(t => !t.active).length;
  }
}
