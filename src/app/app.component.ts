import {Component, OnInit, OnDestroy, HostListener} from '@angular/core';
import {Router, RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import { AuthService } from './services/auth.service';
import { BonusService } from './services/bonus.service';
import { NgIf } from '@angular/common';
import { User } from './models/auth.model';
import { registerLocaleData } from '@angular/common';
import localePl from '@angular/common/locales/pl';
import {Subscription} from 'rxjs';

registerLocaleData(localePl);

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, NgIf, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  lastScrollTop = 0;
  pointsBalance: number = 0;
  private subscription: Subscription | null = null;
  private pointsUpdateSubscription: Subscription | null = null;

  constructor(public authService: AuthService, private bonusService: BonusService, private router: Router) {}

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const header = document.getElementById('main-header');
    if (!header) return;

    const currentScroll = window.scrollY;

    if (currentScroll > this.lastScrollTop) {
      header.style.top = '-120px';
    } else {
      header.style.top = '0';
    }
    this.lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
  }

  ngOnInit(): void {
    if (this.authService.isLoggedIn && this.authService.isUser) {
      this.loadPointsBalance();

      this.pointsUpdateSubscription = this.bonusService.getPointsUpdateListener().subscribe(() => {
        this.loadPointsBalance();
      });
    }
  }

  private loadPointsBalance(): void {
    this.subscription = this.bonusService.getPointsBalance().subscribe(
      (data) => {
        this.pointsBalance = data.balance;
      },
      (error) => {
        console.error('Error fetching points balance:', error);
        this.pointsBalance = 0;
      }
    );
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.pointsUpdateSubscription) {
      this.pointsUpdateSubscription.unsubscribe();
    }
  }
}
