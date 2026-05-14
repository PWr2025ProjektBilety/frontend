import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgClass, NgIf } from '@angular/common';
import QrScanner from 'qr-scanner';

import { finalize, interval, Subscription } from 'rxjs';

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
  manualTicketCode = '';
  manualChecking = false;

  lockDurationMinutes = 20;
  vehicleLocked = false;
  lockRemainingSeconds = 0;
  lockLoading = false;
  private lockStatusSub: Subscription | null = null;

  resultMessage = '';
  resultType = '';

  @ViewChild('video') protected video!: ElementRef<HTMLVideoElement>;
  private scanner: QrScanner | null = null;
  private lastCode: string | null = null;
  private inspecting = false;
  protected scannerActive = false;
  protected startingScanner = false;
  private readonly scanCooldownMs = 1200;

  constructor(private ticketService: TicketService) {}

  ngOnInit(): void {
    this.updateScannerState();
  }

  ngAfterViewInit(): void {
    this.video.nativeElement.playsInline = true;
    this.video.nativeElement.muted = true;
    this.updateScannerState();
  }

  ngOnDestroy(): void {
    if (this.lockStatusSub) {
      this.lockStatusSub.unsubscribe();
      this.lockStatusSub = null;
    }
    this.scanner?.stop();
    this.scanner?.destroy();
    this.scanner = null;
  }

  protected onVehicleIdChange(): void {
    this.lastCode = null;
    this.resultMessage = '';
    this.updateScannerState();

    if (this.lockStatusSub) {
      this.lockStatusSub.unsubscribe();
      this.lockStatusSub = null;
    }

    this.vehicleLocked = false;
    this.lockRemainingSeconds = 0;

    const hasVehicle = !!this.vehicleId?.trim();
    if (hasVehicle) {
      this.refreshLockStatus();
      this.lockStatusSub = interval(1000).subscribe(() => {
        if (this.lockRemainingSeconds > 0) {
          this.lockRemainingSeconds -= 1;
        }
        if (this.lockRemainingSeconds <= 0 && this.vehicleLocked) {
          this.refreshLockStatus();
        }
      });
    }
  }

  protected checkTicketManually(): void {
    const code = (this.manualTicketCode ?? '').trim();
    const vehicle = (this.vehicleId ?? '').trim();
    if (!code || !vehicle) {
      this.resultMessage = 'Wpisz kod biletu i numer pojazdu.';
      this.resultType = 'warning';
      return;
    }

    if (this.manualChecking) return;
    this.manualChecking = true;
    this.resultMessage = 'Sprawdzanie biletu...';
    this.resultType = 'info';

    this.ticketService
      .checkTicket(code, vehicle)
      .pipe(finalize(() => (this.manualChecking = false)))
      .subscribe({
        next: (ok) => {
          if (ok) {
            this.resultMessage = 'Bilet jest ważny.';
            this.resultType = 'success';
            return;
          }
          this.resultMessage = 'Bilet jest nieważny.';
          this.resultType = 'danger';
        },
        error: () => {
          this.resultMessage = 'Nie znaleziono biletu lub wystąpił błąd.';
          this.resultType = 'danger';
        },
      });
  }

  protected lockVehicleValidation(): void {
    const vehicle = (this.vehicleId ?? '').trim();
    if (!vehicle) {
      this.resultMessage = 'Wpisz numer pojazdu.';
      this.resultType = 'warning';
      return;
    }

    if (this.lockLoading) return;
    this.lockLoading = true;

    this.ticketService
      .lockVehicleValidation(vehicle, this.lockDurationMinutes)
      .pipe(finalize(() => (this.lockLoading = false)))
      .subscribe({
        next: (status) => {
          this.vehicleLocked = status.locked;
          this.lockRemainingSeconds = status.remainingSeconds;
          this.resultMessage = 'Kasowanie biletów w pojeździe zostało zablokowane.';
          this.resultType = 'warning';
        },
        error: () => {
          this.resultMessage = 'Nie udało się zablokować kasowania biletów.';
          this.resultType = 'danger';
        },
      });
  }

  protected unlockVehicleValidation(): void {
    const vehicle = (this.vehicleId ?? '').trim();
    if (!vehicle) {
      this.resultMessage = 'Wpisz numer pojazdu.';
      this.resultType = 'warning';
      return;
    }

    if (this.lockLoading) return;
    this.lockLoading = true;

    this.ticketService
      .unlockVehicleValidation(vehicle)
      .pipe(finalize(() => (this.lockLoading = false)))
      .subscribe({
        next: (status) => {
          this.vehicleLocked = status.locked;
          this.lockRemainingSeconds = status.remainingSeconds;
          this.resultMessage = 'Kasowanie biletów w pojeździe zostało odblokowane.';
          this.resultType = 'info';
        },
        error: () => {
          this.resultMessage = 'Nie udało się odblokować kasowania biletów.';
          this.resultType = 'danger';
        },
      });
  }

  private refreshLockStatus(): void {
    const vehicle = (this.vehicleId ?? '').trim();
    if (!vehicle) return;

    this.ticketService.getVehicleValidationLockStatus(vehicle).subscribe({
      next: (status) => {
        this.vehicleLocked = status.locked;
        this.lockRemainingSeconds = status.remainingSeconds;
      },
      error: () => {
        this.vehicleLocked = false;
        this.lockRemainingSeconds = 0;
      },
    });
  }

  private updateScannerState(): void {
    const hasVehicle = !!this.vehicleId?.trim();

    if (!hasVehicle) {
      this.scanner?.stop();
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
      if (!this.scanner) {
        QrScanner.WORKER_PATH = new URL(
          'qr-scanner/qr-scanner-worker.min.js',
          import.meta.url,
        ).toString();

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
      }

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
    this.scanner?.stop();
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
    this.scanner?.stop();
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
