// ============================================
// Bean There, Done That — Home Component
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
  selector:    'app-home',
  standalone:  true,
  imports:     [CommonModule, FormsModule, RouterLink],
  templateUrl: './home.html',
  styleUrls:   ['./home.css']
})
export class Home {

  private authService = inject(AuthService);
  private cafeService = inject(CafeService);       // ← added

  isLoggedIn = false;

  readonly features = [
    {
      icon:  '🔍',
      title: 'Search & Discover',
      desc:  'Find cafes and restaurants near you using real Yelp data — names, photos, and categories all in one place.'
    },
    {
      icon:  '⭐',
      title: 'Rate Your Experience',
      desc:  'Log your visit with a 1–5 star rating, who you went with, the best dish you tried, and personal notes.'
    },
    {
      icon:  '📋',
      title: 'Visited & Wishlist',
      desc:  'Keep two separate lists — places you\'ve already been, and places you\'re dreaming of going next.'
    },
    {
      icon:  '🏆',
      title: 'Earn Badges',
      desc:  'Get rewarded for your logging habits. Visit 5 cafes in one city and earn the "Local Expert" badge!'
    }
  ];

  // ── Search state ───────────────────────────────────────────────
  searchLocation = '';
  searchTerm     = 'cafe';
  sortBy: YelpSortBy = 'best_match';
  openNow        = false;

  businesses: YelpBusiness[] = [];
  isLoading   = false;
  hasSearched = false;
  errorMsg    = '';

  currentPage       = 0;
  readonly pageSize = 10;
  totalResults      = 0;

  get totalPages(): number { return Math.ceil(this.totalResults / this.pageSize); }
  get startIndex(): number { return this.currentPage * this.pageSize + 1; }
  get endIndex():   number { return Math.min((this.currentPage + 1) * this.pageSize, this.totalResults); }

  constructor() {
    // ── your original code, untouched ──
    this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
    });
  }

  // ── Search ─────────────────────────────────────────────────────
  onSearch(): void {
    if (!this.searchLocation.trim()) {
      this.errorMsg = 'Please enter a city or address to search.';
      return;
    }
    this.currentPage = 0;
    this.fetchCafes();
  }

  onPageChange(delta: number): void {
    const next = this.currentPage + delta;
    if (next < 0 || next >= this.totalPages) return;
    this.currentPage = next;
    this.fetchCafes();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  useMyLocation(): void {
    if (!navigator.geolocation) {
      this.errorMsg = 'Geolocation is not supported by your browser.';
      return;
    }
    this.isLoading = true;
    this.errorMsg  = '';
    navigator.geolocation.getCurrentPosition(
      pos => {
        this.searchLocation = `${pos.coords.latitude},${pos.coords.longitude}`;
        this.fetchCafes();
      },
      () => {
        this.isLoading = false;
        this.errorMsg  = 'Could not get your location. Please enter it manually.';
      }
    );
  }

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

  private fetchCafes(): void {
    this.isLoading   = true;
    this.errorMsg    = '';
    this.hasSearched = true;

    const coordMatch = this.searchLocation.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/);
    const options: YelpSearchOptions = {
      term:     this.searchTerm || 'cafe',
      sort_by:  this.sortBy,
      limit:    this.pageSize,
      offset:   this.currentPage * this.pageSize,
      open_now: this.openNow || undefined
    };

    if (coordMatch) {
      options.latitude  = parseFloat(coordMatch[1]);
      options.longitude = parseFloat(coordMatch[2]);
    } else {
      options.location = this.searchLocation;
    }

    this.cafeService.searchCafes(options).subscribe({
      next: res => {
        this.businesses   = res.businesses;
        this.totalResults = Math.min(res.total, 1000);
        this.isLoading    = false;
      },
      error: (err: Error) => {
        this.isLoading = false;
        this.errorMsg  = err.message;
      }
    });
  }
}