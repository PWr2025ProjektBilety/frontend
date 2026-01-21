import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgClass, NgIf } from '@angular/common';
import QrScanner from 'qr-scanner';

import { finalize } from 'rxjs';

import { TicketService } from '../../../services/ticket.service';

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
  vehicleId = '';
  resultMessage = '';
  resultType = '';

  @ViewChild('video') protected video!: ElementRef<HTMLVideoElement>;
  private scanner!: QrScanner;
  private lastCode: string | null = null;
  private inspecting = false;

  constructor(private ticketService: TicketService) {}

  ngAfterViewInit(): void {
    QrScanner.WORKER_PATH = new URL(
      'qr-scanner/qr-scanner-worker.min.js',
      import.meta.url,
    ).toString();

    this.scanner = new QrScanner(
      this.video.nativeElement,
      ({ data }) => this.onCodeScanned(data),
      { returnDetailedScanResult: true },
    );

    this.updateScannerState();
  }

  ngOnDestroy(): void {
    if (this.scanner) {
      this.scanner.stop();
      this.scanner.destroy();
    }
  }

  protected onVehicleIdChange(): void {
    this.lastCode = null;
    this.resultMessage = '';
    this.updateScannerState();
  }

  private updateScannerState(): void {
    const hasVehicle = !!this.vehicleId?.trim();

    if (!hasVehicle) {
      if (this.scanner) this.scanner.stop();
      this.resultMessage = 'Wpisz numer pojazdu, aby uruchomić skaner.';
      this.resultType = 'warning';
      return;
    }

    if (this.scanner) this.scanner.start();
    if (!this.resultMessage) {
      this.resultMessage = 'Oczekiwanie na skan...';
      this.resultType = 'info';
    }
  }

  private onCodeScanned(code: string): void {
    const trimmed = (code ?? '').trim();
    if (!trimmed) return;
    if (this.inspecting) return;
    if (this.lastCode === trimmed) return;
    if (!this.vehicleId?.trim()) return;

    this.lastCode = trimmed;
    this.inspecting = true;

    this.resultMessage = 'Sprawdzanie biletu...';
    this.resultType = 'info';

    this.ticketService
      .inspectTicket(trimmed, this.vehicleId)
      .pipe(
        finalize(() => {
          this.inspecting = false;
          setTimeout(() => {
            if (this.lastCode === trimmed) this.lastCode = null;
          }, 250);
        }),
      )
      .subscribe({
        next: (res) => {
          if (res.status === 'valid') {
            this.resultMessage = 'Bilet jest ważny.';
            this.resultType = 'success';
            return;
          }

          switch (res.reason) {
            case 'ticket-not-found':
              this.resultMessage = 'Nie znaleziono biletu.';
              break;
            case 'ticket-not-validated':
              this.resultMessage = 'Bilet nie został skasowany.';
              break;
            case 'ticket-expired':
              this.resultMessage = 'Bilet jest nieważny (wygasł).';
              break;
            case 'ticket-not-valid-for-vehicle':
              this.resultMessage = 'Bilet nie jest ważny w tym pojeździe.';
              break;
            default:
              this.resultMessage = 'Wystąpił nieznany błąd.';
              break;
          }

          this.resultType = 'danger';
        },
        error: () => {
          this.resultMessage = 'Wystąpił błąd podczas sprawdzania biletu.';
          this.resultType = 'danger';
        },
      });
  }

}
