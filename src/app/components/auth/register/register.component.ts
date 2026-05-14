import { Component } from '@angular/core';
import {AuthService} from '../../../services/auth.service';
import {FormsModule, NgForm} from '@angular/forms';
import {NgClass, NgIf} from '@angular/common';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [
    FormsModule,
    NgIf,
    NgClass,
    RouterLink
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  username = '';
  password = '';
  message = '';

  constructor(private userService: AuthService) {}

  onSubmit(form: NgForm) {
    this.userService.register({ username: this.username, password: this.password }).subscribe({
      next: (res) => {
        form.reset();
        this.message = "Rejestracja przebiegła pomyślnie.";
        console.log(res);
      },
      error: (err) => {
        if (err.error && typeof err.error === 'string' && err.error.toLowerCase().includes('exists')) {
          this.message = "Użytkownik o takiej nazwie już istnieje.";
        } else {
          this.message = "Rejestracja nie udała się, możliwy błąd serwera.";
        }
        console.error(err);
      }
    });
  }

  clearMessage() {
    this.message = '';
  }

}
