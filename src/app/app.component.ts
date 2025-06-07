import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';
import { NgIf } from '@angular/common';
import { User } from './models/auth.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, NgIf],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'frontend';
  currentUser: User | null = null;
  private subscription?: Subscription;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.subscription = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  get isLoggedIn(): boolean {
    return !!this.currentUser;
  }
}
