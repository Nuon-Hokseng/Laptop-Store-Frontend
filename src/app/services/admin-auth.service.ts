import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AdminAuthService {
  // Hardcoded admin credentials (update as needed)
  private static readonly ADMIN_EMAIL = 'admin@gmail.com';
  private static readonly ADMIN_PASSWORD = '223412';

  private readonly STORAGE_KEY = 'isAdmin';
  isAdmin = signal<boolean>(false);

  constructor() {
    const persisted = localStorage.getItem(this.STORAGE_KEY) === 'true';
    this.isAdmin.set(persisted);
  }

  login(email: string, password: string): boolean {
    const ok =
      email.trim().toLowerCase() ===
        AdminAuthService.ADMIN_EMAIL.toLowerCase() &&
      password === AdminAuthService.ADMIN_PASSWORD;
    if (ok) {
      this.isAdmin.set(true);
      localStorage.setItem(this.STORAGE_KEY, 'true');
    }
    return ok;
  }

  logout() {
    this.isAdmin.set(false);
    localStorage.removeItem(this.STORAGE_KEY);
  }
}
