import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector:    'app-login',
  standalone:  true,
  imports:     [RouterLink],
  templateUrl: './login.html',
  styleUrls:   ['./login.css']
})
export class Login {

  private authService = inject(AuthService);
  private router      = inject(Router);

  email:    string = '';
  password: string = '';
  loading:  boolean = false;
  error:    string = '';

  onSubmit(): void {

    if (!this.email || !this.password) {
      this.error = 'Please fill in all fields.';
      return;
    }

    this.loading = true;
    this.error   = '';

    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err: any) => {
        this.error   = err?.message || 'Login failed. Please try again.';
        this.loading = false;
      }
    });
  }
}