import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { User } from './models/auth.model';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let router: Router;

  const mockUser: User = { username: '123', role: 'ROLE_USER' };

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['getCurrentUser', 'logout']);

    await TestBed.configureTestingModule({
      imports: [
        AppComponent,
        RouterTestingModule.withRoutes([]),
      ],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;

    router = TestBed.inject(Router);
    spyOn(router, 'navigate');
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should set currentUser on init', () => {
    authServiceSpy.getCurrentUser.and.returnValue(mockUser);
    component.ngOnInit();
    expect(component.currentUser).toEqual(mockUser);
  });

  it('should call logout on authService and navigate to /login', () => {
    component.logout();
    expect(authServiceSpy.logout).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should return true if currentUser is set (isLoggedIn)', () => {
    component.currentUser = mockUser;
    expect(component.isLoggedIn).toBeTrue();
  });

  it('should return false if currentUser is null (isLoggedIn)', () => {
    component.currentUser = null;
    expect(component.isLoggedIn).toBeFalse();
  });
});
