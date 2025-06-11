import {Component, OnInit, OnDestroy, HostListener} from '@angular/core';
import {Router, RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import { AuthService } from './services/auth.service';
import { NgIf } from '@angular/common';
import { User } from './models/auth.model';
import { registerLocaleData } from '@angular/common';
import localePl from '@angular/common/locales/pl';

registerLocaleData(localePl);

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, NgIf, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'frontend';
  currentUser: User | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  get isLoggedIn(): boolean {
    return !!this.currentUser;
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
