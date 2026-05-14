import { QRCodeSVG } from '@akamfoad/qrcode';
import { Component, OnInit } from '@angular/core';
import {
  PurchasedTicketDTO,
  PurchasedTicketPeriodicDTO,
  PurchasedTicketSingleBasedDTO,
  PurchasedTicketTimeBasedDTO
} from '../../../models/ticket.model';
import { DatePipe, DecimalPipe, NgClass, NgForOf, NgIf } from '@angular/common';
import { TicketService } from '../../../services/ticket.service';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-tickets',
  standalone: true,
  imports: [DatePipe, NgIf, NgForOf, NgClass, FormsModule, DecimalPipe],
  templateUrl: './tickets.component.html',
  styleUrl: './tickets.component.scss'
})
export class TicketsComponent implements OnInit {
  tickets: PurchasedTicketDTO[] = [];
  message: string | null = null;
  selectedTicket: any = null;
  selectedTicketDetails: any = null;
  vehicleIdInput: string = '';
  messageTimeout: any;
  page = 0;
  size = 5;
  totalPages = 0;

  constructor(private ticketService: TicketService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.data.subscribe((data) => {
      this.updateTicketsData(data['ticketData']);
    });
  }

  updateTicketsData(res: any) {
    this.tickets = res.content;
    this.totalPages = res.totalPages;
  }

  loadTickets() {
    this.ticketService.getTicketHistory(this.page, this.size).subscribe({
      next: (res) => this.updateTicketsData(res),
      error: () => this.showMessage('Nie udało się załadować historii biletów.')
    });
  }


  isValidated(ticket: any): boolean {
    return !!ticket?.validated;
  }

  isTicketExpired(ticket: any): boolean {
    const now = new Date();
    if (ticket?.expirationDate && new Date(ticket.expirationDate) < now) return true;
    if (ticket?.validTo && new Date(ticket.validTo) < now) return true;
    // Bilety jednorazowe po skasowaniu są technicznie "zużyte"
    if (this.isSingle(ticket) && ticket.validated) return false; // Tutaj decydujesz czy skasowany = czerwony
    return false;
  }

  getTicketColor(ticket: any): string {
    if (this.isTicketExpired(ticket)) return '#f8d7da'; // Pastelowy czerwony
    if (this.isValidated(ticket) || this.isPeriodicActive(ticket)) return '#d1e7dd'; // Pastelowy zielony
    return '#fff3cd'; // Pastelowy żółty
  }

  isPeriodicActive(ticket: any): boolean {
    if (!this.isPeriodic(ticket)) return false;
    const now = new Date();
    return new Date(ticket.validFrom) <= now && now <= new Date(ticket.validTo);
  }

  isSingle(ticket: any): boolean { return 'vehicleId' in ticket; }
  isTimeBased(ticket: any): boolean { return 'validationDate' in ticket; }
  isPeriodic(ticket: any): boolean { return 'validFrom' in ticket; }

  getCodeDataUrl(payload: string): string {
    try {
      const qrCode = new QRCodeSVG(payload, { level: 'H' });
      return qrCode.toDataUrl() ?? '';
    } catch (e) {
      return '';
    }
  }

  getTicketQrPayload(ticket: any): string {
    return ticket?.qrPayload || ticket?.code || '';
  }

  validateTicket() {
    if (!this.selectedTicket || !this.vehicleIdInput.trim()) return;

    this.ticketService.validateTicket(this.selectedTicket.code, this.vehicleIdInput.trim()).subscribe({
      next: () => {
        this.selectedTicket = null;
        this.vehicleIdInput = '';
        this.showMessage("Bilet został pomyślnie skasowany!");
        this.loadTickets();
      },
      error: (err) => {
        let errorMessage = 'Nie udało się skasować biletu.';

        if (err.status === 400 && err.error) {
          errorMessage = 'Nie można skasować biletu! W danym pojeździe trwa kontrola.'
        }

        this.showMessage(errorMessage);
        this.selectedTicket = null;
        this.vehicleIdInput = '';
        console.error('Validation error:', err);
      }
    });
  }

  openValidationPopup(ticket: any) {
    this.selectedTicket = ticket;
    this.selectedTicketDetails = null;
    this.vehicleIdInput = '';
  }

  cancelValidation() { this.selectedTicket = null; }
  showDetails(ticket: any) { this.selectedTicketDetails = ticket; }
  closeDetails() { this.selectedTicketDetails = null; }

  showMessage(msg: string) {
    this.message = msg;
    if (this.messageTimeout) clearTimeout(this.messageTimeout);
    this.messageTimeout = setTimeout(() => this.message = null, 5000);
  }

  closeMessage() { this.message = null; }
  goToPage(p: number) { this.page = p; this.loadTickets(); }
  previousPage() { if (this.page > 0) this.goToPage(this.page - 1); }
  nextPage() { if (this.page < this.totalPages - 1) this.goToPage(this.page + 1); }
  get pages(): number[] { return Array(this.totalPages).fill(0).map((_, i) => i); }
}
