import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { NgClass, NgIf, NgFor } from '@angular/common';

@Component({
  selector: 'app-manage-users',
  templateUrl: './manage-users.component.html',
  styleUrls: ['./manage-users.component.scss'],
  standalone: true,
  imports: [NgClass, NgIf, NgFor]
})
export class ManageUsersComponent implements OnInit {
  users: any[] = [];
  successMessage = '';
  errorMessage = '';
  currentAdminLogin: string | undefined;

  constructor(public authService: AuthService) {
    this.currentAdminLogin = this.authService.getCurrentUser()?.username;
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.authService.getAllUsers().subscribe({
      next: (data) => {
        this.users = data.sort((a: any, b: any) => a['id'] - b['id']);
      },
      error: () => this.errorMessage = 'Błąd pobierania danych.'
    });
  }

  onRoleChange(userId: number, login: string, newRole: string): void {
    this.authService.changeUserRole(userId, newRole).subscribe({
      next: () => {
        this.successMessage = `Zmieniono rolę użytkownika ${login} na ${newRole}`;
        this.loadUsers();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Nie udało się zmienić roli (Błąd 403 lub 400).';
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }

  get totalUsersCount(): number {
    return this.users.length;
  }

  get adminsCount(): number {
    return this.users.filter(u => u.role === 'ADMIN').length;
  }
}
