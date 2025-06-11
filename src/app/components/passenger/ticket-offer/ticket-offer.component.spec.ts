import {ComponentFixture, TestBed} from '@angular/core/testing';
import {TicketOfferComponent} from './ticket-offer.component';
import {TicketService} from '../../../services/ticket.service';
import {Router} from '@angular/router';
import {of} from 'rxjs';
import {Ticket, TicketType} from '../../../models/ticket.model';

describe('TicketOfferComponent', () => {
  let component: TicketOfferComponent;
  let fixture: ComponentFixture<TicketOfferComponent>;
  let ticketServiceMock: any;
  let routerMock: any;

  const mockTickets: Ticket[] = [
    { id: 1, type: TicketType.SINGLE_RIDE_TICKET, price: 10, validityPeriod: 90, discountAvailable: true, active: true },
    { id: 2, type: TicketType.TIME_BASED_TICKET, price: 20, validityPeriod: 60, discountAvailable: false, active: true },
    { id: 3, type: TicketType.PERIODIC_TICKET, price: 100, validityPeriod: 30, discountAvailable: true, active: true }
  ];

  beforeEach(async () => {
    ticketServiceMock = {
      getAllTickets: jasmine.createSpy('getAllTickets').and.returnValue(of(mockTickets))
    };

    routerMock = {
      navigate: jasmine.createSpy('navigate')
    };

    await TestBed.configureTestingModule({
      imports: [TicketOfferComponent],
      providers: [
        { provide: TicketService, useValue: ticketServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TicketOfferComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load tickets and split them by type on init', () => {
    component.ngOnInit();

    expect(ticketServiceMock.getAllTickets).toHaveBeenCalled();
    expect(component.tickets.length).toBe(3);

    expect(component.singleRideTickets.length).toBe(1);
    expect(component.singleRideTickets[0].type).toBe('SINGLE_RIDE_TICKET');

    expect(component.timeBasedTickets.length).toBe(1);
    expect(component.timeBasedTickets[0].type).toBe('TIME_BASED_TICKET');

    expect(component.periodicTickets.length).toBe(1);
    expect(component.periodicTickets[0].type).toBe('PERIODIC_TICKET');
  });

  it('should store selected ticket and navigate on goToBuyTicket', () => {
    const ticket = mockTickets[0];
    spyOn(sessionStorage, 'setItem');

    component.goToBuyTicket(ticket);

    expect(sessionStorage.setItem).toHaveBeenCalledWith('selectedTicket', JSON.stringify(ticket));
    expect(routerMock.navigate).toHaveBeenCalledWith(['/buy-ticket'], { state: { ticket } });
  });

});
