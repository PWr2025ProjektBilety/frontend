import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {BehaviorSubject, Observable, tap} from 'rxjs';
import {User, JwtPayload, Request} from '../models/auth.model';
import {jwtDecode} from 'jwt-decode';
import {Router} from '@angular/router';


@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = '/api/user';

  private currentUserSubject = new BehaviorSubject<User | null>(null);

  constructor(private http: HttpClient, private router: Router) {
    const storedUser = sessionStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  register(request: Request): Observable<string> {
    return this.http.post(`${this.apiUrl}/register`, request, { responseType: 'text' });
  }

  login(request: Request): Observable<string> {
    return this.http.post(`${this.apiUrl}/login`, request, { responseType: 'text' }).pipe(
      tap(token => {
        sessionStorage.setItem('jwtToken', token);

        const decoded = jwtDecode<JwtPayload>(token);

        const user: User = {
          username: decoded.sub,
          role: decoded.roles[0]
        };
        console.log(user)

        sessionStorage.setItem('currentUser', JSON.stringify(user));
        this.currentUserSubject.next(user);
      })
    );
  }

  logout(): void {
    sessionStorage.removeItem('jwtToken');
    sessionStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.router.navigate(['/']).then(() => {
      window.location.reload();
    });
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    const token = sessionStorage.getItem('jwtToken');
    if (!token) return false;

    try {
      const decoded: any = jwtDecode(token);
      const now = Date.now() / 1000;
      return decoded.exp && decoded.exp > now;
    } catch (e) {
      return false;
    }
  }

  get isLoggedIn(): boolean {
    return !!this.getCurrentUser() && this.isAuthenticated();
  }

  get isUser(): boolean {
    return this.getCurrentUser()?.role == 'ROLE_USER';
  }

  get isController(): boolean {
    return this.getCurrentUser()?.role == 'ROLE_INSPECTOR';
  }

}
