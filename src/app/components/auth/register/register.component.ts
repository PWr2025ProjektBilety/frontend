import { Component } from '@angular/core';
import {AuthService} from '../../../services/auth.service';
import {FormsModule, NgForm} from '@angular/forms';
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
      error: (err) => {this.message = "Rejestracja nie udała się."
        console.log(err);
      },
    });
  }

  clearMessage() {
    this.message = '';
  }

}
