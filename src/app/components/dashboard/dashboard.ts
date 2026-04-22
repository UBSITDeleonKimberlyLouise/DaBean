import { Component, OnInit } from '@angular/core';
import { CafeService } from '../../services/cafe.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector:    'app-dashboard',
  templateUrl: './dashboard.html',
  styleUrls:   ['./dashboard.css']
})
export class Dashboard implements OnInit {

  publicReviews: any[] = [];
  myReviews:     any[] = [];
  loading        = true;
  error          = '';

  isLoggedIn     = false;
  activeTab      = 'public';         // 'public' | 'mine'

  filterRating   = '';
  filterType     = '';

  readonly typeOptions = [
    'Coffee & Tea', 'Brunch', 'Breakfast & Brunch',
    'Cafes', 'Bakeries', 'Desserts', 'Italian', 'Asian Fusion'
  ];

  constructor(
    private cafeService: CafeService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
    });
    this.loadPublicReviews();
  }

  // ── Data Loaders ─────────────────────────────────────────────────────────

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
}