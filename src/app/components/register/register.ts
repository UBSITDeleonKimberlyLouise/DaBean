import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector:    'app-register',
  templateUrl: './register.component.html',
  styleUrls:   ['./register.component.css']
})
export class RegisterComponent {

  username = '';
  email    = '';
  password = '';
  confirm  = '';
  loading  = false;
  error    = '';

  constructor(
    private authService: AuthService,
    private router:      Router
  ) {}

  onSubmit(): void {
    if (!this.username || !this.email || !this.password || !this.confirm) {
      this.error = 'Please fill in all fields.';
      return;
    }

    if (this.password !== this.confirm) {
      this.error = 'Passwords do not match.';
      return;
    }

    if (this.password.length < 6) {
      this.error = 'Password must be at least 6 characters.';
      return;
    }

    this.loading = true;
    this.error   = '';

    this.authService.register(this.username, this.email, this.password).subscribe({
      next:  ()    => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.error   = err.message;
        this.loading = false;
      }
    });
  }
}
