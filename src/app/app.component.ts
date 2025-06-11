import {Component, OnInit, OnDestroy, HostListener} from '@angular/core';
import {Router, RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import { AuthService } from './services/auth.service';
import { NgIf } from '@angular/common';
import { User } from './models/auth.model';
import { registerLocaleData } from '@angular/common';
import localePl from '@angular/common/locales/pl';
import {Observable, Subscription} from 'rxjs';

registerLocaleData(localePl);

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, NgIf, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  private subscription?: Subscription;

  constructor(public authService: AuthService, private router: Router) {}

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
    this.router.navigate(['/']);
  }

  lastScrollTop = 0;

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const header = document.getElementById('main-header');
    if (!header) return;

    const currentScroll = window.scrollY;

    if (currentScroll > this.lastScrollTop) {
      // Scroll w dół – ukryj nagłówek
      header.style.top = '-120px';
    } else {
      // Scroll w górę – pokaż nagłówek
      header.style.top = '0';
    }

    this.lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
  }
}
