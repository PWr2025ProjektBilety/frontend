import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import {BuyTicketComponent} from './buy-ticket.component';
import {TicketService} from '../../../services/ticket.service';
import {ActivatedRoute, Router} from '@angular/router';
import {of, throwError} from 'rxjs';
import {FormsModule} from '@angular/forms';
import {Ticket, TicketType} from '../../../models/ticket.model';

describe('BuyTicketComponent', () => {
  let component: BuyTicketComponent;
  let fixture: ComponentFixture<BuyTicketComponent>;
  let ticketServiceSpy: jasmine.SpyObj<TicketService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const fakeTicket: Ticket = {
    id: 1,
    type: TicketType.SINGLE_RIDE_TICKET,
    price: 10,
    validityPeriod: 90,
    discountAvailable: true,
    active: true
  };

  beforeEach(() => {
    const ticketServiceMock = jasmine.createSpyObj('TicketService', ['buyTicket']);
    const routerMock = jasmine.createSpyObj('Router', ['navigate', 'getCurrentNavigation']);

    routerMock.getCurrentNavigation.and.returnValue({
      extras: { state: { ticket: fakeTicket } }
    } as any);

    TestBed.configureTestingModule({
      imports: [FormsModule, BuyTicketComponent],
      providers: [
        { provide: TicketService, useValue: ticketServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: {} }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BuyTicketComponent);
    component = fixture.componentInstance;
    ticketServiceSpy = TestBed.inject(TicketService) as jasmine.SpyObj<TicketService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    fixture.detectChanges();
  });

  it('should create component and load ticket from navigation state', () => {
    expect(component).toBeTruthy();
    expect(component.ticket).toEqual(fakeTicket);
  });

  it('should return correct Polish ticket type', () => {
    expect(component.getTicketTypePolish('SINGLE_RIDE_TICKET')).toBe('Bilet jednorazowy');
    expect(component.getTicketTypePolish('TIME_BASED_TICKET')).toBe('Bilet czasowy');
    expect(component.getTicketTypePolish('PERIODIC_TICKET')).toBe('Bilet okresowy');
    expect(component.getTicketTypePolish('UNKNOWN')).toBe('Nieznany typ biletu');
  });

  it('should cancel and navigate to /offer', () => {
    component.cancel();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/offer']);
  });

  it('should close popup and navigate to /offer', () => {
    component.message = 'Test message';
    component.closePopup();
    expect(component.message).toBeNull();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/offer']);
  });

  it('should buy ticket and show success message', fakeAsync(() => {
    const response = { code: 'XYZ123', finalPrice: 5 } as any;
    ticketServiceSpy.buyTicket.and.returnValue(of(response));

    component.buy();

    tick();

    expect(ticketServiceSpy.buyTicket).toHaveBeenCalled();
    expect(component.message).toContain('Kupiono bilet');
    expect(component.message).toContain(response.code);
  }));

  it('should handle error when buying ticket', fakeAsync(() => {
    ticketServiceSpy.buyTicket.and.returnValue(throwError(() => new Error('Error!')));

    component.buy();

    tick();

    expect(component.message).toBe('Kupno biletu nie powiodło się.');
  }));

  it('should get today as date string', () => {
    const today = new Date().toISOString().split('T')[0];
    expect(component.getTodayAsDateString()).toBe(today);
  });

  it('should get max date string with offset months', () => {
    const date = new Date();
    date.setMonth(date.getMonth() + 6);
    const expected = date.toISOString().split('T')[0];
    expect(component.getMaxDateString(6)).toBe(expected);
  });

  it('should get activation date ISO string', () => {
    component.activationDate = '2025-06-11';
    expect(component.getActivationDateISO()).toBe('2025-06-11T00:00:00.000Z');
  });

  it('should return empty string if activationDate is empty', () => {
    component.activationDate = '';
    expect(component.getActivationDateISO()).toBe('');
  });
});
