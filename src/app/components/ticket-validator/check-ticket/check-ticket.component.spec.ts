import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CheckTicketComponent } from './check-ticket.component';
import { TicketService } from '../../../services/ticket.service';
import { of, throwError } from 'rxjs';

describe('CheckTicketComponent', () => {
  let component: CheckTicketComponent;
  let fixture: ComponentFixture<CheckTicketComponent>;
  let ticketServiceSpy: jasmine.SpyObj<TicketService>;

  beforeEach(async () => {
    ticketServiceSpy = jasmine.createSpyObj('TicketService', ['checkTicket']);

    await TestBed.configureTestingModule({
      imports: [CheckTicketComponent],
      providers: [{ provide: TicketService, useValue: ticketServiceSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(CheckTicketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should disable the check button if ticketCode or vehicleId are empty or whitespace', () => {
    component.ticketCode = '';
    component.vehicleId = '';
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button');
    expect(button.disabled).toBeTrue();

    component.ticketCode = '  ';
    component.vehicleId = '123';
    fixture.detectChanges();
    expect(button.disabled).toBeTrue();

    component.ticketCode = 'code';
    component.vehicleId = '  ';
    fixture.detectChanges();
    expect(button.disabled).toBeTrue();

    component.ticketCode = 'code';
    component.vehicleId = '123';
    fixture.detectChanges();
    expect(button.disabled).toBeFalse();
  });

  it('should call ticketService.checkTicket with correct parameters and show success message on valid ticket', fakeAsync(() => {
    component.ticketCode = 'ticket123';
    component.vehicleId = 'veh456';

    ticketServiceSpy.checkTicket.and.returnValue(of(true));

    component.checkTicket();
    tick();

    expect(ticketServiceSpy.checkTicket).toHaveBeenCalledWith('ticket123', 'veh456');
    expect(component.resultMessage).toBe('Bilet jest ważny.');
    expect(component.resultType).toBe('success');
  }));

  it('should show error message when ticket is invalid', fakeAsync(() => {
    component.ticketCode = 'ticket123';
    component.vehicleId = 'veh456';

    ticketServiceSpy.checkTicket.and.returnValue(of(false));

    component.checkTicket();
    tick();

    expect(component.resultMessage).toBe('Bilet jest nieważny.');
    expect(component.resultType).toBe('danger');
  }));

  it('should show error message on service error', fakeAsync(() => {
    component.ticketCode = 'ticket123';
    component.vehicleId = 'veh456';

    ticketServiceSpy.checkTicket.and.returnValue(throwError(() => new Error('Service error')));

    spyOn(console, 'error');

    component.checkTicket();
    tick();

    expect(component.resultMessage).toBe('Nie znaleziono biletu lub wystąpił błąd.');
    expect(component.resultType).toBe('danger');
    expect(console.error).toHaveBeenCalled();
  }));

});
