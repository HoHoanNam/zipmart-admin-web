import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AdminAuthService } from './core/auth/admin-auth.service';
import { Navbar } from './shared/components/navbar/navbar';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  readonly authService = inject(AdminAuthService);
}
