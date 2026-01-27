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
  protected scannerActive = false;
  protected startingScanner = false;
  private readonly scanCooldownMs = 1200;

  constructor(private ticketService: TicketService) {}

  ngAfterViewInit(): void {
    QrScanner.WORKER_PATH = new URL(
      'qr-scanner/qr-scanner-worker.min.js',
      import.meta.url,
    ).toString();

    this.video.nativeElement.playsInline = true;
    this.video.nativeElement.muted = true;

    this.scanner = new QrScanner(
      this.video.nativeElement,
      ({ data }) => this.onCodeScanned(data),
      {
        returnDetailedScanResult: true,
        preferredCamera: 'environment',
        highlightScanRegion: true,
        highlightCodeOutline: true,
        maxScansPerSecond: 12,
      },
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
      this.scannerActive = false;
      this.resultMessage = 'Wpisz numer pojazdu, aby uruchomić skaner.';
      this.resultType = 'warning';
      return;
    }

    if (!this.scannerActive && !this.resultMessage) {
      this.resultMessage = 'Naciśnij „Uruchom kamerę”, aby rozpocząć skanowanie.';
      this.resultType = 'info';
    }
  }

  protected async startScanner(): Promise<void> {
    if (this.startingScanner) return;

    const hasVehicle = !!this.vehicleId?.trim();
    if (!hasVehicle) {
      this.resultMessage = 'Wpisz numer pojazdu, aby uruchomić skaner.';
      this.resultType = 'warning';
      return;
    }

    if (!window.isSecureContext) {
      this.resultMessage = 'Kamera wymaga HTTPS (bezpiecznego połączenia). Otwórz stronę przez https:// lub localhost.';
      this.resultType = 'danger';
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      this.resultMessage = 'Ta przeglądarka nie obsługuje dostępu do kamery (getUserMedia).';
      this.resultType = 'danger';
      return;
    }

    this.startingScanner = true;
    this.resultMessage = 'Uruchamianie kamery...';
    this.resultType = 'info';

    try {
      await this.scanner.start();
      // Prefer back camera if the library supports it.
      (this.scanner as unknown as { setCamera?: (c: string) => Promise<void> | void }).setCamera?.('environment');
      this.scannerActive = true;
      this.resultMessage = 'Oczekiwanie na skan...';
      this.resultType = 'info';
    } catch (e: unknown) {
      this.scannerActive = false;
      const msg = e instanceof Error ? e.message : String(e);
      this.resultMessage = `Nie udało się uruchomić kamery: ${msg}`;
      this.resultType = 'danger';
    } finally {
      this.startingScanner = false;
    }
  }

  protected stopScanner(): void {
    if (this.scanner) this.scanner.stop();
    this.scannerActive = false;
    this.updateScannerState();
  }

  private onCodeScanned(code: string): void {
    const trimmed = (code ?? '').trim();
    if (!trimmed) return;
    if (this.inspecting) return;
    if (this.lastCode === trimmed) return;
    if (!this.vehicleId?.trim()) return;

    this.lastCode = trimmed;
    this.inspecting = true;
    // Pause scanning while we validate/inspect, so we don't keep decoding frames.
    if (this.scanner) this.scanner.stop();
    this.scannerActive = false;

    this.resultMessage = 'Sprawdzanie biletu...';
    this.resultType = 'info';

    this.ticketService
      .inspectTicket(trimmed, this.vehicleId)
      .pipe(
        finalize(() => {
          this.inspecting = false;
          setTimeout(async () => {
            if (this.lastCode === trimmed) this.lastCode = null;
            // Auto-resume scanning after a short cooldown, if vehicleId is still present.
            if (!this.vehicleId?.trim()) return;
            if (!this.scanner) return;
            try {
              await this.scanner.start();
              this.scannerActive = true;
            } catch {
              // Ignore resume errors; user can try starting again.
              this.scannerActive = false;
            }
          }, this.scanCooldownMs);
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
            case 'invalid-qr':
              this.resultMessage = 'Nieprawidłowy kod QR (błędny podpis).';
              break;
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
