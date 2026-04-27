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

  private _review: any = null;  // internal review property

  // ── Called by parent to set review data ─────────────────
  setReview(review: any) {
    this._review = review;
  }

  // ── Getter for template ───────────────────────────────
  review(): any {
    return this._review;
  }

  // ── Check if current user is the owner ────────────────
  isOwner(): boolean {
    const user = this.authService.currentUserValue;
    return user?.username === this._review?.username;
  }

  // ── Helpers ──────────────────────────────────────────
  getStars(rating: number): { filled: boolean }[] {
    return Array.from({ length: 5 }, (_, i) => ({ filled: i < rating }));
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-PH', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  }

  // ── Trigger actions ──────────────────────────────────
  emitEdit(): void {
    const event = new CustomEvent('reviewEdit', { detail: this._review });
    window.dispatchEvent(event);
  }

  emitDelete(): void {
    const event = new CustomEvent('reviewDelete', { detail: this._review._id });
    window.dispatchEvent(event);
  }
}