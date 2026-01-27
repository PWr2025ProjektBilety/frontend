import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { TicketsComponent } from './tickets.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TicketService } from '../../../services/ticket.service';
import { of, throwError } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

describe('TicketsComponent', () => {
  let component: TicketsComponent;
  let fixture: ComponentFixture<TicketsComponent>;
  let ticketServiceMock: any;
  let activatedRouteMock: any;

  const mockTicketData = {
    content: [
      { code: 'A1', validated: false, vehicleId: '123' }, // single-based
      { code: 'B2', validated: true, validationDate: '2025-01-01', expirationDate: '2025-01-02' }, // time-based
      { code: 'C3', validFrom: '2025-01-01', validTo: '2025-12-31' } // periodic
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
      imports: [TicketsComponent, HttpClientTestingModule],
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

  it('should load tickets on loadTickets call', () => {
    component.loadTickets();
    expect(ticketServiceMock.getTicketHistory).toHaveBeenCalledWith(component.page, component.size);
    expect(component.tickets.length).toBe(3);
  });

  it('should handle error on loadTickets', () => {
    ticketServiceMock.getTicketHistory.and.returnValue(throwError(() => new Error('fail')));
    component.loadTickets();
    expect(component.message).toBe('Nie udało się załadować historii biletów.');
  });

  it('should go to previous page and load tickets', () => {
    component.page = 1;
    component.previousPage();
    expect(component.page).toBe(0);
    expect(ticketServiceMock.getTicketHistory).toHaveBeenCalled();
  });

  it('should go to next page and load tickets', () => {
    component.page = 0;
    component.totalPages = 3;
    component.nextPage();
    expect(component.page).toBe(1);
    expect(ticketServiceMock.getTicketHistory).toHaveBeenCalled();
  });

  it('should identify ticket types correctly', () => {
    const single = { vehicleId: 'v1' } as any;
    const time = { validationDate: 'd', expirationDate: 'd' } as any;
    const periodic = { validFrom: 'd', validTo: 'd' } as any;

    expect(component.isSingle(single)).toBeTrue();
    expect(component.isTimeBased(time)).toBeTrue();
    expect(component.isPeriodic(periodic)).toBeTrue();
  });

  it('should return correct card class for tickets', () => {
    const now = new Date();

    const singleTicketValidated = { validated: true, vehicleId: 'v' } as any;
    expect(component.getCardClass(singleTicketValidated)).toBe('bg-success-subtle');

    const singleTicketNotValidated = { validated: false, vehicleId: 'v' } as any;
    expect(component.getCardClass(singleTicketNotValidated)).toBe('bg-warning-subtle');

    const timeTicketValidatedNotExpired = {
      validated: true,
      validationDate: now.toISOString(),
      expirationDate: new Date(now.getTime() + 10000).toISOString()
    } as any;
    expect(component.getCardClass(timeTicketValidatedNotExpired)).toBe('bg-success-subtle');

    const timeTicketValidatedExpired = {
      validated: true,
      validationDate: now.toISOString(),
      expirationDate: new Date(now.getTime() - 10000).toISOString()
    } as any;
    expect(component.getCardClass(timeTicketValidatedExpired)).toBe('bg-light');

    const timeTicketNotValidated = {
      validated: false,
      validationDate: now.toISOString(),
      expirationDate: new Date(now.getTime() + 10000).toISOString()
    } as any;
    expect(component.getCardClass(timeTicketNotValidated)).toBe('bg-warning-subtle');

    const periodicTicketValid = {
      validFrom: new Date(now.getTime() - 10000).toISOString(),
      validTo: new Date(now.getTime() + 10000).toISOString()
    } as any;
    expect(component.getCardClass(periodicTicketValid)).toBe('bg-success-subtle');

    const periodicTicketInvalid = {
      validFrom: new Date(now.getTime() - 20000).toISOString(),
      validTo: new Date(now.getTime() - 10000).toISOString()
    } as any;
    expect(component.getCardClass(periodicTicketInvalid)).toBe('bg-light');
  });

  it('should validate ticket and reset form on success', fakeAsync(() => {
    component.selectedTicket = { code: 'code123' } as any;
    component.vehicleIdInput = 'bus42';

    component.loadTickets = jasmine.createSpy('loadTickets');

    component.validateTicket();
    tick();

    expect(ticketServiceMock.validateTicket).toHaveBeenCalledWith('code123', 'bus42');
    expect(component.message).toBe('Bilet został skasowany.');
    expect(component.selectedTicket).toBeNull();
    expect(component.vehicleIdInput).toBe('');
    expect(component.loadTickets).toHaveBeenCalled();
  }));

  it('should handle validation error', fakeAsync(() => {
    ticketServiceMock.validateTicket.and.returnValue(throwError(() => new Error('fail')));
    component.selectedTicket = { code: 'code123' } as any;
    component.vehicleIdInput = 'bus42';

    component.validateTicket();
    tick();

    expect(component.message).toBe('Nie udało się skasować biletu.');
  }));

});
