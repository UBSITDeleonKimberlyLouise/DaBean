import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CafeService } from '../../services/cafe.service';
import { ReviewCard } from '../review-card/review-card';
import { ReviewForm } from '../review-form/review-form';



@Component({
  selector:    'app-profile',
  imports: [ReviewCard,ReviewForm],
  templateUrl: './profile.html',
  styleUrls:   ['./profile.css']
})
export class Profile {

  private cafeService = inject(CafeService);
  private authService = inject(AuthService);

  currentUser: any   = null;
  allReviews:  any[] = [];
  badges:      any[] = [];

  loading        = true;
  error          = '';

  activeFilter   = 'all';    
  editingReview: any = null;
  showEditForm      = false;

  // ── Computed lists ───────────────────────────────────────────────────────

  get visitedList():  any[] { return this.allReviews.filter(r => r.is_visited); }
  get wishlistList(): any[] { return this.allReviews.filter(r => !r.is_visited); }

  get filteredReviews(): any[] {
    if (this.activeFilter === 'visited')  { return this.visitedList;  }
    if (this.activeFilter === 'wishlist') { return this.wishlistList; }
    return this.allReviews;
  }

  get averageRating(): string {
    const rated = this.visitedList.filter(r => r.rating > 0);
    if (!rated.length) { return '—'; }
    const avg = rated.reduce((sum, r) => sum + r.rating, 0) / rated.length;
    return avg.toFixed(1);
  }

  constructor() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
    this.loadData();
  }
  

  // ── Loaders ───────────────────────────────────────────────────────────────

  loadData(): void {
    this.loading = true;
    this.error   = '';

    this.cafeService.getMyReviews().subscribe({
      next: (data) => {
        this.allReviews = data.reviews ?? data ?? [];
        this.loading    = false;
      },
      error: (err) => {
        this.error   = err.message;
        this.loading = false;
      }
    });

    this.cafeService.getUserBadges().subscribe({
      next:  (data) => { this.badges = data.badges ?? []; },
      error: ()     => {}                   // badges are non-critical
    });
  }

  // ── CRUD ──────────────────────────────────────────────────────────────────

  startEdit(review: any): void {
    this.editingReview = review;
    this.showEditForm  = true;
    setTimeout(() => {
      const el = document.getElementById('edit-form-anchor');
      if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    }, 80);
  }

  onEditSaved(): void {
    this.showEditForm  = false;
    this.editingReview = null;
    this.loadData();
  }

  cancelEdit(): void {
    this.showEditForm  = false;
    this.editingReview = null;
  }

  formatJoinDate(dateStr: string | undefined): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
}

  deleteReview(id: string): void {
    if (!confirm('Remove this cafe from your log?')) { return; }

    this.cafeService.deleteReview(id).subscribe({
      next:  ()    => { this.allReviews = this.allReviews.filter(r => r._id !== id); },
      error: (err) => { this.error = err.message; }
    });
  }

  setFilter(f: string): void {
    this.activeFilter = f;
  }
}