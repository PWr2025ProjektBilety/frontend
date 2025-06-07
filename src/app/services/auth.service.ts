import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {BehaviorSubject, Observable, tap} from 'rxjs';
import {User, JwtPayload} from '../models/auth.model';
import {jwtDecode} from 'jwt-decode';

interface RegisterRequest {
  username: string;
  password: string;
}

interface LoginRequest {
  username: string;
  password: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/user';

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  register(request: RegisterRequest): Observable<string> {
    return this.http.post(`${this.apiUrl}/register`, request, { responseType: 'text' });
  }

  login(request: LoginRequest): Observable<string> {
    return this.http.post(`${this.apiUrl}/login`, request, { responseType: 'text' }).pipe(
      tap(token => {
        localStorage.setItem('jwtToken', token);

        const decoded = jwtDecode<JwtPayload>(token);

        const user: User = {
          username: decoded.sub,
          role: decoded.roles[0]
        };
        console.log(user)

        localStorage.setItem('currentUser', JSON.stringify(user));
        this.currentUserSubject.next(user);
      })
    );
  }


  logout(): void {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }
}
