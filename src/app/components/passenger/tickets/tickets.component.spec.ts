import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { TicketsComponent } from './tickets.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TicketService } from '../../../services/ticket.service';
import { of, throwError } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';

describe('TicketsComponent', () => {
  let component: TicketsComponent;
  let fixture: ComponentFixture<TicketsComponent>;
  let ticketServiceMock: any;
  let activatedRouteMock: any;

  const mockTicketData = {
    content: [
      { code: 'A1', validated: false, vehicleId: '123', purchaseDate: '2025-01-01' },
      { code: 'B2', validated: true, validationDate: '2025-01-01', expirationDate: '2025-01-02', purchaseDate: '2025-01-01' },
      { code: 'C3', validFrom: '2025-01-01', validTo: '2025-12-31', purchaseDate: '2025-01-01' }
    ],
    totalPages: 3
  };

  beforeEach(async () => {
    ticketServiceMock = {
      getTicketHistory: jasmine.createSpy('getTicketHistory').and.returnValue(of(mockTicketData)),
      validateTicket: jasmine.createSpy('validateTicket').and.returnValue(of({}))
    };

    activatedRouteMock = {
      data: of({ ticketData: mockTicketData })
    };

    await TestBed.configureTestingModule({
      imports: [TicketsComponent, HttpClientTestingModule, FormsModule],
      providers: [
        { provide: TicketService, useValue: ticketServiceMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TicketsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component and load tickets from resolver data', () => {
    expect(component).toBeTruthy();
    expect(component.tickets.length).toBe(3);
    expect(component.totalPages).toBe(3);
  });

  it('should identify ticket types correctly', () => {
    const single = { vehicleId: 'v1' };
    const time = { validationDate: 'd' }; // w nowej wersji sprawdzasz validationDate dla TimeBased
    const periodic = { validFrom: 'd' };

    expect(component.isSingle(single)).toBeTrue();
    expect(component.isTimeBased(time)).toBeTrue();
    expect(component.isPeriodic(periodic)).toBeTrue();
  });

  it('should return correct pastel colors for ticket states', () => {
    const now = new Date();

    // Nieużyty (żółty pastelowy)
    const singleNew = { vehicleId: 'v', validated: false };
    expect(component.getTicketColor(singleNew)).toBe('#fff3cd');

    // Aktywny (zielony pastelowy)
    const singleValidated = { vehicleId: 'v', validated: true };
    expect(component.getTicketColor(singleValidated)).toBe('#d1e7dd');

    // Przeterminowany (czerwony pastelowy)
    const expiredTime = {
      expirationDate: new Date(now.getTime() - 10000).toISOString(),
      validationDate: now.toISOString()
    };
    expect(component.getTicketColor(expiredTime)).toBe('#f8d7da');
  });

  it('should handle successful ticket validation', fakeAsync(() => {
    // Przygotowanie
    component.selectedTicket = { code: 'code123' };
    component.vehicleIdInput = 'bus42';
    spyOn(component, 'loadTickets');
    spyOn(component, 'showMessage');

    // Akcja
    component.validateTicket();
    tick();

    // Weryfikacja
    expect(ticketServiceMock.validateTicket).toHaveBeenCalledWith('code123', 'bus42');
    expect(component.selectedTicket).toBeNull();
    expect(component.vehicleIdInput).toBe('');
    expect(component.showMessage).toHaveBeenCalledWith('Bilet został pomyślnie skasowany!');
    expect(component.loadTickets).toHaveBeenCalled();
  }));

  it('should handle validation error and show message', fakeAsync(() => {
    ticketServiceMock.validateTicket.and.returnValue(throwError(() => new Error('fail')));
    component.selectedTicket = { code: 'code123' };
    component.vehicleIdInput = 'bus42';
    spyOn(component, 'showMessage');

    component.validateTicket();
    tick();

    expect(component.showMessage).toHaveBeenCalledWith('Nie udało się skasować biletu.');
    expect(component.selectedTicket).not.toBeNull(); // Nie czyścimy przy błędzie, by user mógł poprawić nr wozu
  }));

  it('should manage messages with timeout', fakeAsync(() => {
    component.showMessage('Test message');
    expect(component.message).toBe('Test message');

    tick(5000); // Czekamy na timeout zdefiniowany w komponencie
    expect(component.message).toBeNull();
  }));

  it('should correctly determine if periodic ticket is active', () => {
    const now = new Date();
    const activePeriodic = {
      validFrom: new Date(now.getTime() - 10000).toISOString(),
      validTo: new Date(now.getTime() + 10000).toISOString(),
      type: 'PERIODIC_TICKET'
    };
    const futurePeriodic = {
      validFrom: new Date(now.getTime() + 10000).toISOString(),
      validTo: new Date(now.getTime() + 20000).toISOString(),
      type: 'PERIODIC_TICKET'
    };

    expect(component.isPeriodicActive(activePeriodic)).toBeTrue();
    expect(component.isPeriodicActive(futurePeriodic)).toBeFalse();
  });
});
