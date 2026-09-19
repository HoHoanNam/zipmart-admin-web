import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminAuthService } from '../../core/auth/admin-auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
})
export class Login {
  private readonly authService = inject(AdminAuthService);
  private readonly router = inject(Router);

  email = '';
  password = '';

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  async onSubmit(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      await this.authService.login(this.email, this.password);
      if (!this.authService.isAdmin()) {
        this.authService.logout();
        this.error.set('Tài khoản này không có quyền quản trị.');
        return;
      }
      this.router.navigateByUrl('/dashboard');
    } catch {
      this.error.set('Email hoặc mật khẩu không đúng.');
    } finally {
      this.loading.set(false);
    }
  }
}
