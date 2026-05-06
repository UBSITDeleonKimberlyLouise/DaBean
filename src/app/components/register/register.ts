import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CafeService } from '../../services/cafe.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector:    'app-register',
  standalone:  true,
  imports:     [CommonModule, RouterLink, FormsModule],
  templateUrl: './register.html',
  styleUrls:   ['./register.css']
})
export class Register {

  private cafeService = inject(CafeService);
  private router      = inject(Router);

  cafe_name    = '';
  rating       = 5;
  review_text  = '';
  date_visited = '';
  companions   = '';
  best_dish    = '';
  is_public    = true;
  loading      = false;
  error        = '';

  onSubmit(): void {
    if (!this.cafe_name || !this.rating) {
      this.error = 'Please fill in the cafe name and rating.';
      return;
    }

    this.loading = true;
    this.error   = '';

    this.cafeService.createReview({
      cafe_name:    this.cafe_name,
      yelp_id:      '',
      rating:       this.rating,
      review_text:  this.review_text,
      date_visited: this.date_visited,
      companions:   this.companions,
      best_dish:    this.best_dish,
      is_visited:   true,
      is_public:    this.is_public,
      category:     '',
      address:      '',
      image_url:    ''
    }).subscribe({
      next:  ()    => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.error   = err.message;
        this.loading = false;
      }
    });
  }
}