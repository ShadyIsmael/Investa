import { Injectable, signal } from '@angular/core';

export type UserRole = 'investor' | 'founder';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  isAuthenticated = signal<boolean>(false);
  userRole = signal<UserRole | null>(null);

  constructor() {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const role = localStorage.getItem('userRole') as UserRole | null;
    if (loggedIn && role) {
      this.isAuthenticated.set(true);
      this.userRole.set(role);
    }
  }

  login(role: UserRole): void {
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userRole', role);
    this.isAuthenticated.set(true);
    this.userRole.set(role);
  }

  logout(): void {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
    this.isAuthenticated.set(false);
    this.userRole.set(null);
  }
}
