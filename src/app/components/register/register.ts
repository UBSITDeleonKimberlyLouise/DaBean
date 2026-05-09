import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router'; // Added ActivatedRoute
import { CafeService, YelpBusiness } from '../../services/cafe.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector:    'app-register',
  standalone:  true,
  imports:     [CommonModule, RouterLink, FormsModule],
  templateUrl: './register.html',
  styleUrls:   ['./register.css']
})
export class Register implements OnInit {

  private cafeService = inject(CafeService);
  private router      = inject(Router);
  private route       = inject(ActivatedRoute); // Injected to receive map data

  // These will be auto-filled from the map selection
  cafe_name    = '';
  yelp_id      = '';
  category     = '';
  address      = '';
  image_url    = '';

  // User input fields
  rating       = 5;
  review_text  = '';
  date_visited = '';
  companions   = '';
  best_dish    = '';
  is_public    = true;
  loading      = false;
  error        = '';

  ngOnInit(): void {
    // Check if a cafe was passed from the map via query parameters
    this.route.queryParams.subscribe(params => {
      if (params['name']) {
        this.cafe_name = params['name'];
        this.yelp_id   = params['id'];
        this.address   = params['address'];
        this.category  = params['category'];
      }
    });
  }

  onSubmit(): void {
    if (!this.cafe_name || !this.rating) {
      this.error = 'Please select a cafe from the map and provide a rating.';
      return;
    }

    this.loading = true;
    this.error   = '';

    this.cafeService.createReview({
      cafe_name:    this.cafe_name,
      yelp_id:      this.yelp_id,
      rating:       this.rating,
      review_text:  this.review_text,
      date_visited: this.date_visited,
      companions:   this.companions,
      best_dish:    this.best_dish,
      is_visited:   true,
      is_public:    this.is_public,
      category:     this.category,
      address:      this.address,
      image_url:    this.image_url
    }).subscribe({
      next:  ()    => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.error   = err.message;
        this.loading = false;
      }
    });
  }
}