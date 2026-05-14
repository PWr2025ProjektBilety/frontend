import { Injectable } from '@angular/core';
import {BuyTicketRequest, PurchasedTicketDTO, Ticket, TicketValidationRequest} from '../models/ticket.model';
import { Observable } from 'rxjs';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {Page} from '../models/page.model';
import { BonusService } from './bonus.service';
import { tap } from 'rxjs/operators';

export interface InspectTicketResponse {
  status: 'valid' | 'invalid';
  reason: string;
}

export interface VehicleTicketValidationLockRequest {
  vehicleId: string;
  durationMinutes?: number;
}

export interface VehicleTicketValidationLockStatus {
  locked: boolean;
  lockedUntilEpochSeconds: number | null;
  remainingSeconds: number;
}

@Injectable({
  providedIn: 'root',
})
export class TicketService {
  private readonly BASE_URL = '/api';
  private readonly TICKETS_URL = `${this.BASE_URL}/tickets`;
  private readonly PURCHASED_URL = `${this.BASE_URL}/boughttickets`;
  private readonly INSPECTION_URL = `${this.BASE_URL}/ticket-inspection`;
  private readonly VEHICLE_LOCK_URL = `${this.BASE_URL}/vehicle-ticket-validation-lock`;

  constructor(private http: HttpClient, private bonusService: BonusService) {}

  private getAuthHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('jwtToken') || '';
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  getAllTickets(): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(this.TICKETS_URL, {
      headers: this.getAuthHeaders(),
    });
  }

  buyTicket(request: BuyTicketRequest): Observable<PurchasedTicketDTO> {
    return this.http.post<PurchasedTicketDTO>(
      `${this.PURCHASED_URL}/buy`,
      request,
      { headers: this.getAuthHeaders() }
    ).pipe(
      tap(() => {
        this.bonusService.notifyPointsChanged();
      })
    );
  }

  getTicketHistory(page: number, size: number): Observable<Page<PurchasedTicketDTO>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<Page<PurchasedTicketDTO>>(
      `${this.PURCHASED_URL}/history`,
      {
        headers: this.getAuthHeaders(),
        params,
      }
    );
  }

  validateTicket(ticketId: string, vehicleId: string): Observable<string> {
    const request: TicketValidationRequest = { ticketId, vehicleId };

    const headers = this.getAuthHeaders().set('Content-Type', 'application/json');

    return this.http.post<string>(
      `${this.PURCHASED_URL}/validate`,
      request,
      {
        headers,
        responseType: 'text' as 'json',
      }
    );
  }

  checkTicket(ticketCode: string, vehicleId: string): Observable<boolean> {
    const headers = this.getAuthHeaders().set('Content-Type', 'application/json');

    const body = { ticketCode: ticketCode.trim(), vehicleId: vehicleId.trim() };

    return this.http.post<boolean>(this.INSPECTION_URL, body, { headers });
  }

  getAllTicketsForAdmin(): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(`${this.TICKETS_URL}/all`, {
      headers: this.getAuthHeaders(), // <-- TO MUSI TU BYĆ
    });
  }

  createTicket(ticket: Ticket): Observable<Ticket> {
    return this.http.post<Ticket>(this.TICKETS_URL, ticket, {
      headers: this.getAuthHeaders(),
    });
  }

  deleteTicket(id: number): Observable<void> {
    return this.http.delete<void>(`${this.TICKETS_URL}/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }

  inspectTicket(code: string, vehicleId: string): Observable<InspectTicketResponse> {
    const headers = this.getAuthHeaders().set('Content-Type', 'application/json');

    const body = { vehicleId: vehicleId.trim() };

    return this.http.post<InspectTicketResponse>(`${this.TICKETS_URL}/${encodeURIComponent(code.trim())}/inspect`, body, { headers });
  }

  getVehicleValidationLockStatus(vehicleId: string): Observable<VehicleTicketValidationLockStatus> {
    const headers = this.getAuthHeaders();
    return this.http.get<VehicleTicketValidationLockStatus>(
      `${this.VEHICLE_LOCK_URL}/${encodeURIComponent(vehicleId.trim())}`,
      { headers }
    );
  }

  lockVehicleValidation(vehicleId: string, durationMinutes?: number): Observable<VehicleTicketValidationLockStatus> {
    const headers = this.getAuthHeaders().set('Content-Type', 'application/json');
    const body: VehicleTicketValidationLockRequest = {
      vehicleId: vehicleId.trim(),
      durationMinutes,
    };
    return this.http.post<VehicleTicketValidationLockStatus>(`${this.VEHICLE_LOCK_URL}/lock`, body, { headers });
  }

  unlockVehicleValidation(vehicleId: string): Observable<VehicleTicketValidationLockStatus> {
    const headers = this.getAuthHeaders().set('Content-Type', 'application/json');
    const body: VehicleTicketValidationLockRequest = {
      vehicleId: vehicleId.trim(),
    };
    return this.http.post<VehicleTicketValidationLockStatus>(`${this.VEHICLE_LOCK_URL}/unlock`, body, { headers });
  }

}
