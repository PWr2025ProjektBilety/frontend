import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import {FormsModule, NgForm} from '@angular/forms';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [FormsModule, NgIf],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  username = '';
  password = '';
  message = '';

  constructor(private authService: AuthService, private router: Router) {}

  onLogin() {
    this.authService.login({ username: this.username, password: this.password }).subscribe({
      next: (res) => {
        this.message = 'Logged in successfully!';
        console.log(res);
        this.router.navigate(['']);
      },
      error: (err) => {
        this.message = err.error || 'Login failed';
        console.log(err);
      },
    });
  }
}
