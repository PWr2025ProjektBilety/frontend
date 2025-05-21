import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-register',
  imports: [
    FormsModule,
    NgIf
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  login = '';
  password = '';
  error = '';
  success = '';

  constructor(private authService: AuthService, private router: Router) {}

  register() {
    this.error = '';
    this.authService.register(this.login, this.password).subscribe({
      next: user => {
        this.success = `Rejestracja udana! Witaj, ${user.login}. Jesteś teraz zalogowany.`;
        this.router.navigate(['/tickets']);
      },
      error: err => this.error = err.message
    });
  }
}
