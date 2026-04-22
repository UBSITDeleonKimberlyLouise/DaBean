// ============================================
// Bean There, Done That — Login Component
// Author: [Student Name]
// Date: 2025
// Assignment: Cafe Tracker Application
// ============================================

import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector:    'app-login',
  templateUrl: './login.html',
  styleUrls:   ['./login.css']
})
export class Login {

  email    = '';
  password = '';
  loading  = false;
  error    = '';

  constructor(
    private authService: AuthService,
    private router:      Router
  ) {}

  onSubmit(): void {
    if (!this.email || !this.password) {
      this.error = 'Please fill in all fields.';
      return;
    }

    this.loading = true;
    this.error   = '';

    this.authService.login(this.email, this.password).subscribe({
      next:  ()    => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.error   = err.message;
        this.loading = false;
      }
    });
  }
}