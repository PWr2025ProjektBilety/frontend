import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeComponent } from './home.component';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/auth.model';
import { By } from '@angular/platform-browser';
import { NgIf } from '@angular/common';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  const mockUser: User = { username: 'testuser', role: 'ROLE_USER' };
  const mockInspector: User = { username: 'inspector', role: 'ROLE_INSPECTOR' };

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated', 'getCurrentUser']);

    await TestBed.configureTestingModule({
      imports: [NgIf, HomeComponent],
      providers: [{ provide: AuthService, useValue: authServiceSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set isLoggedIn and currentUser on init', () => {
    authServiceSpy.isAuthenticated.and.returnValue(true);
    authServiceSpy.getCurrentUser.and.returnValue(mockUser);

    component.ngOnInit();

    expect(component.isLoggedIn).toBeTrue();
    expect(component.currentUser).toEqual(mockUser);
  });

  it('should display user message when logged in as ROLE_USER', () => {
    authServiceSpy.isAuthenticated.and.returnValue(true);
    authServiceSpy.getCurrentUser.and.returnValue(mockUser);

    component.ngOnInit();
    fixture.detectChanges();

    const userGreeting = fixture.debugElement.query(By.css('div p.fs-5'));
    expect(userGreeting.nativeElement.textContent).toContain(`Cześć, ${mockUser.username}!`);

    const offersText = fixture.nativeElement.textContent;
    expect(offersText).toContain('Oferty biletowe');
    expect(offersText).toContain('Moje bilety');
  });

  it('should display inspector message when logged in as ROLE_INSPECTOR', () => {
    authServiceSpy.isAuthenticated.and.returnValue(true);
    authServiceSpy.getCurrentUser.and.returnValue(mockInspector);

    component.ngOnInit();
    fixture.detectChanges();

    const inspectorGreeting = fixture.debugElement.query(By.css('div p.fs-5'));
    expect(inspectorGreeting.nativeElement.textContent).toContain(`Cześć, kontrolerze ${mockInspector.username}!`);

    expect(fixture.nativeElement.textContent).toContain('Sprawdź bilet');
  });
});
