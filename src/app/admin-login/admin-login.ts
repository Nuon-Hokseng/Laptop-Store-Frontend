import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminAuthService } from '../services/admin-auth.service';
import { PopupService } from '../shared/popup.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-login.html',
  styleUrls: ['./admin-login.css'],
})
export class AdminLogin {
  private adminAuth = inject(AdminAuthService);
  private router = inject(Router);
  private popup = inject(PopupService);

  email = '';
  password = '';
  isSubmitting = false;

  submit() {
    if (this.isSubmitting) return;
    this.isSubmitting = true;

    // No async, but mimic brief processing state
    const success = this.adminAuth.login(this.email, this.password);
    this.isSubmitting = false;

    if (success) {
      this.popup.show('Welcome, admin!', { type: 'success', durationMs: 1200 });
      this.router.navigate(['/admin']);
    } else {
      this.popup.show('Invalid admin credentials.', {
        type: 'error',
        durationMs: 2500,
      });
    }
  }
}
