// ============================================
// Bean There, Done That — Dashboard Component
// Author: [Student Name]
// Date: 2025
// Assignment: Cafe Tracker Application
// ============================================

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CafeService, YelpBusiness, YelpSearchOptions, YelpSortBy } from '../../services/cafe.service';

@Component({
  selector:    'app-dashboard',
  standalone:  true,
  imports:     [CommonModule, FormsModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrls:   ['./dashboard.css']
})
export class Dashboard {

  private cafeService = inject(CafeService);
  private authService = inject(AuthService);

  // ── Auth ──────────────────────────────────────────────────────────────────
  isLoggedIn = false;

  // ── Reviews (logged-in features) ──────────────────────────────────────────
  publicReviews: any[] = [];
  myReviews:     any[] = [];
  activeTab      = 'public';         // 'public' | 'mine'
  filterRating   = '';
  filterType     = '';

  readonly typeOptions = [
    'Coffee & Tea', 'Brunch', 'Breakfast & Brunch',
    'Cafes', 'Bakeries', 'Desserts', 'Italian', 'Asian Fusion'
  ];

  // ── Guest search (available to everyone) ─────────────────────────────────
  searchTerm:     string = '';
  searchLocation: string = '';
  sortBy: YelpSortBy     = 'best_match';
  openNow:        boolean = false;

  businesses:  YelpBusiness[] = [];
  searched     = false;

  // ── Shared state ──────────────────────────────────────────────────────────
  loading = false;
  error   = '';

  constructor() {
    this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
    });
    this.loadPublicReviews();
  }

  // ── Guest: Cafe search (no login required) ────────────────────────────────

  searchCafes(): void {
    if (!this.searchTerm && !this.searchLocation) {
      this.error = 'Please enter a cafe name or location.';
      return;
    }

    this.loading  = true;
    this.error    = '';
    this.searched = true;
    this.businesses = [];

    const options: YelpSearchOptions = {
      term:     this.searchTerm     || 'cafe',
      sort_by:  this.sortBy,
      open_now: this.openNow || undefined
    };

    const coordMatch = this.searchLocation.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/);
    if (coordMatch) {
      options.latitude  = parseFloat(coordMatch[1]);
      options.longitude = parseFloat(coordMatch[2]);
    } else {
      if (!options.latitude) {
        options.latitude  = 16.4023;
        options.longitude = 120.5960;
      }
    }

    this.cafeService.searchCafes(options).subscribe({
      next: (data) => {
        this.businesses = data.businesses ?? [];
        this.loading    = false;
      },
      error: (err) => {
        this.error   = err.message;
        this.loading = false;
      }
    });
  }

  useMyLocation(): void {
    if (!navigator.geolocation) {
      this.error = 'Geolocation is not supported by your browser.';
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => {
        this.searchLocation = `${pos.coords.latitude},${pos.coords.longitude}`;
        this.searchCafes();
      },
      () => { this.error = 'Could not get your location. Please enter it manually.'; }
    );
  }

  // ── Reviews: Public ───────────────────────────────────────────────────────

  loadPublicReviews(): void {
    this.loading = true;
    this.error   = '';

    const filters: any = {};
    if (this.filterRating) { filters.rating = +this.filterRating; }
    if (this.filterType)   { filters.type   =  this.filterType;   }

    this.cafeService.getPublicReviews(filters).subscribe({
      next:  (data) => {
        this.publicReviews = data.reviews ?? data ?? [];
        this.loading       = false;
      },
      error: (err) => {
        this.error   = err.message;
        this.loading = false;
      }
    });
  }

  loadMyReviews(): void {
    if (!this.isLoggedIn) { return; }
    this.loading = true;
    this.error   = '';

    this.cafeService.getMyReviews().subscribe({
      next:  (data) => {
        this.myReviews = data.reviews ?? data ?? [];
        this.loading   = false;
      },
      error: (err) => {
        this.error   = err.message;
        this.loading = false;
      }
    });
  }

  // ── Add Log ───────────────────────────────────────────────────────────────
log = {
  cafe_name:    '',
  rating:       5,
  review_text:  '',
  best_dish:    '',
  date_visited: '',
  companions:   '',
  is_public:    true
};
logLoading = false;
logError   = '';
logSuccess = false;

submitLog(): void {
  if (!this.log.cafe_name) {
    this.logError = 'Please enter a cafe name.';
    return;
  }

  this.logLoading = true;
  this.logError   = '';
  this.logSuccess = false;

  this.cafeService.createReview({
    ...this.log,
    yelp_id:    '',
    is_visited: true,
    category:   '',
    address:    '',
    image_url:  ''
  }).subscribe({
    next: () => {
      this.logLoading = false;
      this.logSuccess = true;
      this.log = { cafe_name: '', rating: 5, review_text: '', best_dish: '', date_visited: '', companions: '', is_public: true };
      setTimeout(() => {
        this.logSuccess = false;
        this.setTab('public');
      }, 1500);
    },
    error: (err) => {
      this.logError   = err.message;
      this.logLoading = false;
    }
  });
}

  // ── Tab & Filter ──────────────────────────────────────────────────────────

  setTab(tab: string): void {
    this.activeTab = tab;
    if (tab === 'mine') {
      this.loadMyReviews();
    } else {
      this.loadPublicReviews();
    }
  }

  applyFilters(): void {
    this.loadPublicReviews();
  }

  clearFilters(): void {
    this.filterRating = '';
    this.filterType   = '';
    this.loadPublicReviews();
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  getRatingStars(rating: number): string {
    const full  = Math.floor(rating);
    const half  = rating % 1 >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
  }

  getDistanceKm(meters?: number): string {
    if (meters == null) return '';
    return meters >= 1000
      ? `${(meters / 1000).toFixed(1)} km`
      : `${Math.round(meters)} m`;
  }

  getCategoryLabels(biz: YelpBusiness): string {
    return biz.categories.slice(0, 3).map(c => c.title).join(' · ');
  }
}