import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeComponent } from './home.component';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/auth.model';
import { By } from '@angular/platform-browser';
import { NgIf } from '@angular/common';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  const mockUser: User = { username: 'testuser', role: 'ROLE_USER' };
  const mockInspector: User = { username: 'inspector', role: 'ROLE_INSPECTOR' };

  class MockAuthService {
    private _user: User | null = null;

    isAuthenticated(): boolean {
      return !!this._user;
    }

    getCurrentUser(): User | null {
      return this._user;
    }

    setMockUser(user: User | null) {
      this._user = user;
    }

    get isUser(): boolean {
      return this._user?.role === 'ROLE_USER';
    }

    get isController(): boolean {
      return this._user?.role === 'ROLE_INSPECTOR';
    }
  }

  let mockAuthService: MockAuthService;

  beforeEach(async () => {
    mockAuthService = new MockAuthService();

    await TestBed.configureTestingModule({
      imports: [NgIf, HomeComponent],
      providers: [{ provide: AuthService, useValue: mockAuthService }]
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set isLoggedIn and currentUser on init', () => {
    mockAuthService.setMockUser(mockUser);

    component.ngOnInit();

    expect(component.isLoggedIn).toBeTrue();
    expect(component.currentUser).toEqual(mockUser);
  });

  it('should display user message when logged in as ROLE_USER', () => {
    mockAuthService.setMockUser(mockUser);

    component.ngOnInit();
    fixture.detectChanges();

    const userGreeting = fixture.debugElement.query(By.css('div p.fs-5'));
    expect(userGreeting.nativeElement.textContent).toContain(`Cześć, ${mockUser.username}!`);

    const offersText = fixture.nativeElement.textContent;
    expect(offersText).toContain('Oferty biletowe');
    expect(offersText).toContain('Moje bilety');
  });

  it('should display inspector message when logged in as ROLE_INSPECTOR', () => {
    mockAuthService.setMockUser(mockInspector);

    component.ngOnInit();
    fixture.detectChanges();

    const inspectorGreeting = fixture.debugElement.query(By.css('div p.fs-5'));
    expect(inspectorGreeting.nativeElement.textContent).toContain(`Cześć, kontrolerze ${mockInspector.username}!`);
    expect(fixture.nativeElement.textContent).toContain('Sprawdź bilet');
  });

  it('should display info for anonymous user', () => {
    mockAuthService.setMockUser(null);

    component.ngOnInit();
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Prosty system do kupowania i weryfikacji biletów transportu miejskiego');
    expect(text).toContain('Możesz się zarejestrować lub zalogować');
  });
});
