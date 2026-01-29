import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import {Router, RouterLink} from '@angular/router';
import {FormsModule } from '@angular/forms';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [FormsModule, NgIf, RouterLink],
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
        this.message = 'Zalogowano się pomyślnie!';
        console.log(res);
        this.router.navigate(['']);
      },
      error: (err) => {
        this.message = 'Nie udało się zalogować. Nazwa użytkownika lub hasło są niepoprawne.';
        console.log(err);
      },
    });
  }

  clearMessage() {
    this.message = '';
  }

}
