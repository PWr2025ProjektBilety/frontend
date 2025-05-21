import { Injectable } from '@angular/core';
import { Observable, of, throwError, BehaviorSubject } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private users: User[] = [];
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    this.loadFromSession();
  }

  private loadFromSession() {
    const usersJson = sessionStorage.getItem('users');
    if (usersJson) {
      this.users = JSON.parse(usersJson);
    } else {
      // Dodaj domyślnego kontrolera, jeśli nie ma użytkowników
      this.users = [{ login: 'controller1', password: 'ctrl123', role: 'controller' }];
      this.saveUsers();
    }

    const currentUserJson = sessionStorage.getItem('currentUser');
    if (currentUserJson) {
      this.currentUserSubject.next(JSON.parse(currentUserJson));
    }
  }

  private saveUsers() {
    sessionStorage.setItem('users', JSON.stringify(this.users));
  }

  private saveCurrentUser(user: User | null) {
    if (user) {
      sessionStorage.setItem('currentUser', JSON.stringify(user));
    } else {
      sessionStorage.removeItem('currentUser');
    }
  }

  register(login: string, password: string): Observable<User> {
    if (this.users.find(u => u.login === login)) {
      return throwError(() => new Error('Użytkownik już istnieje'));
    }
    const newUser: User = { login, password, role: 'passenger' };
    this.users.push(newUser);
    this.saveUsers();

    this.currentUserSubject.next(newUser);
    this.saveCurrentUser(newUser);
    return of(newUser);
  }

  login(login: string, password: string): Observable<User> {
    const user = this.users.find(u => u.login === login && u.password === password);
    if (user) {
      this.currentUserSubject.next(user);
      this.saveCurrentUser(user);
      return of(user);
    } else {
      return throwError(() => new Error('Nieprawidłowe dane logowania'));
    }
  }

  logout() {
    this.currentUserSubject.next(null);
    this.saveCurrentUser(null);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
}
