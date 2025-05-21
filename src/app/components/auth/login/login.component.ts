import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [FormsModule, NgIf],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  login = '';
  password = '';
  error = '';

  constructor(private authService: AuthService, private router: Router) {}

  loginUser() {
    this.error = '';
    this.authService.login(this.login, this.password).subscribe({
      next: () => this.router.navigate(['/tickets']),
      error: err => this.error = err.message
    });
  }
}
