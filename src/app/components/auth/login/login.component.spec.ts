import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['login']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [FormsModule, LoginComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the login component', () => {
    expect(component).toBeTruthy();
  });

  it('should disable the submit button if username or password is empty', () => {
    component.username = '';
    component.password = '';
    fixture.detectChanges();

    const button = fixture.debugElement.query(By.css('button[type=submit]')).nativeElement as HTMLButtonElement;
    expect(button.disabled).toBeTrue();

    component.username = 'user';
    fixture.detectChanges();
    expect(button.disabled).toBeTrue();

    component.password = 'pass';
    fixture.detectChanges();
    expect(button.disabled).toBeFalse();
  });

  it('should call authService.login on onLogin and navigate on success', fakeAsync(() => {
    component.username = 'testuser';
    component.password = 'testpass';

    authServiceSpy.login.and.returnValue(of('fake-token'));

    component.onLogin();
    tick();

    expect(authServiceSpy.login).toHaveBeenCalledWith({ username: 'testuser', password: 'testpass' });
    expect(component.message).toBe('Zalogowano się pomyślnie!');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['']);
  }));

  it('should set error message on login failure', fakeAsync(() => {
    component.username = 'wronguser';
    component.password = 'wrongpass';

    authServiceSpy.login.and.returnValue(throwError(() => new Error('Unauthorized')));

    component.onLogin();
    tick();

    expect(authServiceSpy.login).toHaveBeenCalledWith({ username: 'wronguser', password: 'wrongpass' });
    expect(component.message).toBe('Nie udało się zalogować. Nazwa użytkownika lub hasło są niepoprawne.');
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  }));

  it('should bind username and password from input fields', fakeAsync(() => {
    const usernameInput = fixture.debugElement.query(By.css('input#loginUsername')).nativeElement as HTMLInputElement;
    const passwordInput = fixture.debugElement.query(By.css('input#loginPassword')).nativeElement as HTMLInputElement;

    usernameInput.value = 'myUser';
    usernameInput.dispatchEvent(new Event('input'));

    passwordInput.value = 'myPass';
    passwordInput.dispatchEvent(new Event('input'));

    tick();
    fixture.detectChanges();

    expect(component.username).toBe('myUser');
    expect(component.password).toBe('myPass');
  }));

  it('should display error message in template if message is set', () => {
    component.message = 'Error occurred';
    fixture.detectChanges();

    const messageDiv = fixture.debugElement.query(By.css('.text-danger'));
    expect(messageDiv.nativeElement.textContent).toContain('Error occurred');
  });
});
