import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-review-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './review-card.html',
  styleUrls: ['./review-card.css']
})
export class ReviewCard {
  private authService = inject(AuthService);

  private _review: any = null;

  // ── Called by parent to set review data ───────────────
  setReview(review: any) {
    this._review = review;
  }

  // ── Getter for template (use as review()) ─────────────
  review(): any {
    return this._review;
  }

  // ── Check if current user is the owner ────────────────
  isOwner(): boolean {
    const user = this.authService.currentUser; // ✅ FIXED
    return user?.username === this._review?.username;
  }

  // ── Helpers ──────────────────────────────────────────
  getStars(rating: number): { filled: boolean }[] {
    return Array.from({ length: 5 }, (_, i) => ({
      filled: i < (rating || 0) // ✅ avoid undefined crash
    }));
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // ── Trigger actions (custom events) ───────────────────
  emitEdit(): void {
    if (!this._review) return;

    window.dispatchEvent(
      new CustomEvent('reviewEdit', {
        detail: this._review
      })
    );
  }

  emitDelete(): void {
    if (!this._review?._id) return;

    window.dispatchEvent(
      new CustomEvent('reviewDelete', {
        detail: this._review._id
      })
    );
  }
}