import {Component, OnInit} from '@angular/core';
import {
  PurchasedTicketDTO, PurchasedTicketPeriodicDTO,
  PurchasedTicketSingleBasedDTO,
  PurchasedTicketTimeBasedDTO
} from '../../../models/ticket.model';
import {DatePipe, NgClass, NgForOf, NgIf} from '@angular/common';
import {TicketService} from '../../../services/ticket.service';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-tickets',
  imports: [
    DatePipe,
    NgIf,
    NgForOf,
    NgClass,
    FormsModule
  ],
  templateUrl: './tickets.component.html',
  styleUrl: './tickets.component.scss'
})
export class TicketsComponent implements OnInit {
  tickets: PurchasedTicketDTO[] = [];
  message: string | null = null;
  selectedTicket: PurchasedTicketDTO | null = null;
  selectedTicketDetails: PurchasedTicketDTO | null = null;
  vehicleIdInput: string = '';
  messageTimeout: any;
  page = 0;
  size = 5;
  totalPages = 0;

  constructor(private ticketService: TicketService) {}

  ngOnInit(): void {
    this.loadTickets();
  }

  loadTickets() {
    this.ticketService.getTicketHistory(this.page, this.size).subscribe({
      next: (res) => {
        this.tickets = res.content;
        this.totalPages = res.totalPages;
        console.log(res)
      },
      error: (err) => {
        this.message = 'Nie udało się załadować historii biletów.';
        console.error(err);
      }
    });
  }

  previousPage() {
    if (this.page > 0) {
      this.page--;
      this.loadTickets();
    }
  }

  nextPage() {
    if (this.page < this.totalPages - 1) {
      this.page++;
      this.loadTickets();
    }
  }

  get pages(): number[] {
    return Array(this.totalPages).fill(0).map((_, i) => i);
  }

  goToPage(p: number) {
    if (p >= 0 && p < this.totalPages) {
      this.page = p;
      this.loadTickets();
    }
  }

  isSingle(ticket: PurchasedTicketDTO): ticket is PurchasedTicketSingleBasedDTO {
    return 'vehicleId' in ticket;
  }

  isTimeBased(ticket: PurchasedTicketDTO): ticket is PurchasedTicketTimeBasedDTO {
    return 'validationDate' in ticket && 'expirationDate' in ticket;
  }

  isPeriodic(ticket: PurchasedTicketDTO): ticket is PurchasedTicketPeriodicDTO {
    return 'validFrom' in ticket && 'validTo' in ticket;
  }

  getCardClass(ticket: PurchasedTicketDTO): string {
    const now = new Date();

    if (this.isSingle(ticket)) {
      return ticket.validated ? 'bg-success-subtle' : 'bg-warning-subtle';
    }

    if (this.isTimeBased(ticket)) {
      if (!ticket.validated) {
        return 'bg-warning-subtle';
      } else if (new Date(ticket.expirationDate) > now) {
        return 'bg-success-subtle';
      } else {
        return 'bg-light';
      }
    }

    if (this.isPeriodic(ticket)) {
      const validFrom = new Date(ticket.validFrom);
      const validTo = new Date(ticket.validTo);
      if (validFrom <= now && now <= validTo) {
        return 'bg-success-subtle';
      } else {
        return 'bg-light';
      }
    }

    return 'bg-light';
  }

  validateTicket() {
    if (!this.selectedTicket || !this.vehicleIdInput.trim()) {
      return;
    }

    this.ticketService.validateTicket(this.selectedTicket.code, this.vehicleIdInput.trim()).subscribe({
      next: () => {
        this.message = 'Bilet został skasowany.';
        this.showMessage(this.message)
        this.selectedTicket = null;
        this.vehicleIdInput = '';
        this.loadTickets();
      },
      error: err => {
        this.message = 'Nie udało się skasować biletu.'
        this.showMessage(this.message)
        console.error(err);
      }
    });
  }

  openValidationPopup(ticket: PurchasedTicketDTO) {
    this.selectedTicket = ticket;
    this.vehicleIdInput = '';
  }

  cancelValidation() {
    this.selectedTicket = null;
    this.vehicleIdInput = '';
  }

  showMessage(msg: string) {
    this.message = msg;

    if (this.messageTimeout) {
      clearTimeout(this.messageTimeout);
    }

    this.messageTimeout = setTimeout(() => {
      this.message = null;
    }, 5000);
  }

  closeMessage() {
    this.message = null;
    if (this.messageTimeout) {
      clearTimeout(this.messageTimeout);
    }
  }

  showDetails(ticket: any): void {
    this.selectedTicketDetails = ticket;
  }

  closeDetails(): void {
    this.selectedTicketDetails = null;
  }

}
