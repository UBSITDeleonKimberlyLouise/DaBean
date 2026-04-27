import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CafeService } from '../../services/cafe.service';
import { ReviewCard } from '../review-card/review-card';
import { ReviewForm } from '../review-form/review-form';

@Component({
  selector:    'app-profile',
  templateUrl: './profile.html',
  styleUrls: ['./profile.css'],
  standalone: true,
  imports: [ReviewCard, ReviewForm]
})
export class Profile {

  private cafeService = inject(CafeService);
  private authService = inject(AuthService);

  currentUser: any = null;
  allReviews: any[] = [];
  badges: any[] = [];

  loading = true;
  error = '';

  activeFilter   = 'all';       // 'all' | 'visited' | 'wishlist'
  editingReview: any = null;
  showEditForm = false;

  constructor() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    this.loadData();
  }

  // safer getters (prevents undefined crashes)
  get visitedList(): any[] {
    return (this.allReviews ?? []).filter(r => r.is_visited);
  }

  get wishlistList(): any[] {
    return (this.allReviews ?? []).filter(r => !r.is_visited);
  }

  get filteredReviews(): any[] {
    const list = this.allReviews ?? [];

    if (this.activeFilter === 'visited') return this.visitedList;
    if (this.activeFilter === 'wishlist') return this.wishlistList;

    return list;
  }

  get averageRating(): string {
    const rated = this.visitedList.filter(r => r.rating > 0);
    if (!rated.length) return '—';

    const avg = rated.reduce((sum, r) => sum + r.rating, 0) / rated.length;
    return avg.toFixed(1);
  }


  // ── Loaders ───────────────────────────────────────────────────────────────

  loadData(): void {
    this.loading = true;
    this.error = '';

    this.cafeService.getMyReviews().subscribe({
      next: (data) => {
        this.allReviews = data?.reviews ?? data ?? [];
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message;
        this.loading = false;
      }
    });

    this.cafeService.getUserBadges().subscribe({
      next: (data) => {
        this.badges = data?.badges ?? [];
      },
      error: () => {}
    });
  }

  setFilter(f: 'all' | 'visited' | 'wishlist'): void {
    this.activeFilter = f;
  }

  startEdit(review: any): void {
    this.editingReview = review;
    this.showEditForm = true;
  }

  cancelEdit(): void {
    this.editingReview = null;
    this.showEditForm = false;
  }

  onEditSaved(): void {
    this.cancelEdit();
    this.loadData();
  }


  deleteReview(id: string): void {
    if (!confirm('Delete this review?')) return;

    this.cafeService.deleteReview(id).subscribe({
      next: () => {
        this.allReviews = this.allReviews.filter(r => r._id !== id);
      },
      error: (err) => {
        this.error = err.message;
      }
    });
  }
}