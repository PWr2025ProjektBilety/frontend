import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CheckTicketComponent } from './check-ticket.component';
import { TicketService } from '../../../services/ticket.service';
import { of, throwError } from 'rxjs';

describe('CheckTicketComponent', () => {
  let component: CheckTicketComponent;
  let fixture: ComponentFixture<CheckTicketComponent>;
  let ticketServiceSpy: jasmine.SpyObj<TicketService>;

  beforeEach(async () => {
    ticketServiceSpy = jasmine.createSpyObj('TicketService', [
      'checkTicket',
      'lockVehicleValidation',
      'unlockVehicleValidation',
      'getVehicleValidationLockStatus',
    ]);

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

  it('should show warning if manual check is invoked without code or vehicleId', () => {
    component.manualTicketCode = '';
    component.vehicleId = '';

    (component as any).checkTicketManually();

    expect(component.resultType).toBe('warning');
    expect(component.resultMessage).toBe('Wpisz kod biletu i numer pojazdu.');
    expect(ticketServiceSpy.checkTicket).not.toHaveBeenCalled();
  });

  it('should call ticketService.checkTicket and show success message on valid ticket', fakeAsync(() => {
    component.manualTicketCode = 'ticket123';
    component.vehicleId = 'veh456';

    ticketServiceSpy.checkTicket.and.returnValue(of(true));

    (component as any).checkTicketManually();
    tick();

    expect(ticketServiceSpy.checkTicket).toHaveBeenCalledWith('ticket123', 'veh456');
    expect(component.resultMessage).toBe('Bilet jest ważny.');
    expect(component.resultType).toBe('success');
  }));

  it('should show error message when manual ticket check is invalid', fakeAsync(() => {
    component.manualTicketCode = 'ticket123';
    component.vehicleId = 'veh456';

    ticketServiceSpy.checkTicket.and.returnValue(of(false));

    (component as any).checkTicketManually();
    tick();

    expect(component.resultMessage).toBe('Bilet jest nieważny.');
    expect(component.resultType).toBe('danger');
  }));

  it('should show error message on manual check service error', fakeAsync(() => {
    component.manualTicketCode = 'ticket123';
    component.vehicleId = 'veh456';

    ticketServiceSpy.checkTicket.and.returnValue(throwError(() => new Error('Service error')));

    (component as any).checkTicketManually();
    tick();

    expect(component.resultMessage).toBe('Nie znaleziono biletu lub wystąpił błąd.');
    expect(component.resultType).toBe('danger');
  }));

  it('should show warning when trying to lock vehicle without vehicleId', () => {
    component.vehicleId = '';

    (component as any).lockVehicleValidation();

    expect(component.resultType).toBe('warning');
    expect(component.resultMessage).toBe('Wpisz numer pojazdu.');
    expect(ticketServiceSpy.lockVehicleValidation).not.toHaveBeenCalled();
  });

  it('should call lockVehicleValidation and update status', fakeAsync(() => {
    component.vehicleId = 'BUS1';
    component.lockDurationMinutes = 20;

    ticketServiceSpy.lockVehicleValidation.and.returnValue(of({
      locked: true,
      lockedUntilEpochSeconds: 123,
      remainingSeconds: 1200,
    }));

    (component as any).lockVehicleValidation();
    tick();

    expect(ticketServiceSpy.lockVehicleValidation).toHaveBeenCalledWith('BUS1', 20);
    expect(component.vehicleLocked).toBeTrue();
    expect(component.lockRemainingSeconds).toBe(1200);
  }));

  it('should call unlockVehicleValidation and update status', fakeAsync(() => {
    component.vehicleId = 'BUS1';
    component.vehicleLocked = true;
    component.lockRemainingSeconds = 100;

    ticketServiceSpy.unlockVehicleValidation.and.returnValue(of({
      locked: false,
      lockedUntilEpochSeconds: null,
      remainingSeconds: 0,
    }));

    (component as any).unlockVehicleValidation();
    tick();

    expect(ticketServiceSpy.unlockVehicleValidation).toHaveBeenCalledWith('BUS1');
    expect(component.vehicleLocked).toBeFalse();
    expect(component.lockRemainingSeconds).toBe(0);
  }));

});
