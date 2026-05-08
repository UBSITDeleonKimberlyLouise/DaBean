import { Component, inject, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CafeService, YelpBusiness, YelpSearchOptions, YelpSortBy } from '../../services/cafe.service';
import * as L from 'leaflet';

@Component({
  selector:    'app-dashboard',
  standalone:  true,
  imports:     [CommonModule, FormsModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrls:   ['./dashboard.css']
})
export class Dashboard implements AfterViewInit {

  private cafeService = inject(CafeService);

  // ── Map ───────────────────────────────────────────────────────────────────
  private map!: L.Map;
  private markersLayer = L.layerGroup();

  // ── Reviews ───────────────────────────────────────────────────────────────
  publicReviews: any[] = [];
  myReviews:     any[] = [];
  activeTab      = 'public';
  filterRating   = '';
  filterType     = '';

  readonly typeOptions = [
    'Coffee & Tea', 'Brunch', 'Breakfast & Brunch',
    'Cafes', 'Bakeries', 'Desserts', 'Italian', 'Asian Fusion'
  ];

  // ── Guest search ──────────────────────────────────────────────────────────
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
    this.loadPublicReviews();
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  ngAfterViewInit(): void {
    this.initMap();
  }

  // ── Map ───────────────────────────────────────────────────────────────────

  private initMap(): void {
    this.map = L.map('cafe-map').setView([16.4023, 120.5960], 13);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap &copy; CARTO'
  }).addTo(this.map);

    this.markersLayer.addTo(this.map);
  }

  private updateMapMarkers(): void {
  this.markersLayer.clearLayers();

  const validBiz = this.businesses.filter(
    (b): b is YelpBusiness & {
      coordinates: {
        latitude: number;
        longitude: number;
      };
    } =>
      b.coordinates !== undefined &&
      b.coordinates.latitude !== undefined &&
      b.coordinates.longitude !== undefined
  );

  validBiz.forEach(biz => {
    const { latitude: lat, longitude: lng } = biz.coordinates;

    L.marker([lat, lng])
      .addTo(this.markersLayer)
      .bindPopup(`
        <strong>${biz.name}</strong><br>
        ${biz.location.display_address.join(', ')}<br>
        ${this.getRatingStars(biz.rating)} (${biz.review_count})
        ${biz.price ? ' · ' + biz.price : ''}
      `);
  });

  if (validBiz.length > 0) {
    const bounds = validBiz.map(
      b => [b.coordinates.latitude, b.coordinates.longitude] as L.LatLngTuple
    );

    this.map.fitBounds(bounds, { padding: [40, 40] });
  }
}
  // ── Cafe Search ───────────────────────────────────────────────────────────

  searchCafes(): void {
    if (!this.searchTerm && !this.searchLocation) {
      this.error = 'Please enter a cafe name or location.';
      return;
    }

    this.loading    = true;
    this.error      = '';
    this.searched   = true;
    this.businesses = [];

    const options: YelpSearchOptions = {
      term:     this.searchTerm || 'cafe',
      sort_by:  this.sortBy,
      open_now: this.openNow || undefined
    };

    const coordMatch = this.searchLocation.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/);
    if (coordMatch) {
      options.latitude  = parseFloat(coordMatch[1]);
      options.longitude = parseFloat(coordMatch[2]);
    } else {
      options.latitude  = 16.4023;
      options.longitude = 120.5960;
    }

    this.cafeService.searchCafes(options).subscribe({
      next: (data) => {
        this.businesses = data.businesses ?? [];
        this.loading    = false;
        this.updateMapMarkers();
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
        this.map.setView([pos.coords.latitude, pos.coords.longitude], 14);
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
      next: (data) => {
        this.publicReviews = (data as any)?.reviews || (data as any)?.data || data || [];
console.log("PUBLIC REVIEWS:", this.publicReviews);
        this.loading       = false;
      },
      error: (err) => {
        this.error   = err.message;
        this.loading = false;
      }
    });
  }

  loadMyReviews(): void {
    this.loading = true;
    this.error   = '';

    this.cafeService.getMyReviews().subscribe({
      next: (data) => {
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
        this.loadPublicReviews();

        this.log = {
          cafe_name: '',
          rating: 5,
          review_text: '',
          best_dish: '',
          date_visited: '',
          companions: '',
          is_public: true
        };

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

  applyFilters(): void { this.loadPublicReviews(); }

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