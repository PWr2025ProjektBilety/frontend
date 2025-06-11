import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterComponent } from './register.component';
import { AuthService } from '../../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import {HttpClientTestingModule} from '@angular/common/http/testing';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authService: AuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsModule, RegisterComponent, HttpClientTestingModule],
      providers: [{ provide: AuthService }]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set success message on successful registration and reset form', () => {
    const formMock = { reset: jasmine.createSpy('reset') } as any;

    spyOn(authService, 'register').and.returnValue(of("success"));

    component.username = 'testuser';
    component.password = 'Password1!';

    component.onSubmit(formMock);

    expect(authService.register).toHaveBeenCalledWith({
      username: 'testuser',
      password: 'Password1!'
    });
    expect(component.message).toBe('Rejestracja przebiegła pomyślnie.');
    expect(formMock.reset).toHaveBeenCalled();
  });

  it('should set error message on failed registration', () => {
    const formMock = { reset: jasmine.createSpy('reset') } as any;

    spyOn(authService, 'register').and.returnValue(throwError(() => new Error('Błąd')));

    component.username = 'testuser';
    component.password = 'Password1!';

    component.onSubmit(formMock);

    expect(authService.register).toHaveBeenCalled();
    expect(component.message).toBe('Rejestracja nie udała się.');
    expect(formMock.reset).not.toHaveBeenCalled();
  });
});
