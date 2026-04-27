// ============================================
// Bean There, Done That — Review Form Component
// Author: [Student Name]
// Date: 2025
// Assignment: Cafe Tracker Application
// ============================================

import { Component, input, output, effect, inject } from '@angular/core';
import { CafeService } from '../../services/cafe.service';

@Component({
  selector:    'app-review-form',
  templateUrl: './review-form.html',
  styleUrls:   ['./review-form.css']
})
export class ReviewForm {

  private cafeService = inject(CafeService);

  // Passed in from Search when adding a new review
  selectedCafe = input<any>(null);
  // Passed in from Profile when editing an existing review
  editReview   = input<any>(null);

  onSaved  = output<void>();
  onCancel = output<void>();

  // Form fields
  rating      = 0;
  reviewText  = '';
  dateVisited = '';
  companions  = '';
  bestDish    = '';
  isVisited   = true;
  isPublic    = true;

  hoveredStar = 0;
  loading     = false;
  success     = '';
  error       = '';

  constructor() {
    // Pre-fill form fields when editing an existing review
    effect(() => {
      const review = this.editReview();
      if (review) {
        this.rating      = review.rating      ?? 0;
        this.reviewText  = review.review_text ?? '';
        this.dateVisited = review.date_visited
          ? review.date_visited.substring(0, 10)
          : '';
        this.companions  = review.companions  ?? '';
        this.bestDish    = review.best_dish   ?? '';
        this.isVisited   = review.is_visited  ?? true;
        this.isPublic    = review.is_public   ?? true;
      }
    });
  }

  // ── Star interaction ──────────────────────────────────────────────────────

  setRating(value: number): void {
    this.rating = value;
  }

  setHover(value: number): void {
    this.hoveredStar = value;
  }

  clearHover(): void {
    this.hoveredStar = 0;
  }

  getStarState(index: number): boolean {
    return index <= (this.hoveredStar || this.rating);
  }

  // ── Submit ────────────────────────────────────────────────────────────────

  onSubmit(): void {
    if (!this.rating) {
      this.error = 'Please select a star rating.';
      return;
    }

    this.loading = true;
    this.error   = '';
    this.success = '';

    if (this.editReview()) {
      this.submitUpdate();
    } else {
      this.submitCreate();
    }
  }

  private submitCreate(): void {
    const cafe    = this.selectedCafe();
    const address = cafe.location?.display_address?.join(', ') ?? '';
    const category = cafe.categories?.map((c: any) => c.title).join(', ') ?? '';

    const payload = {
      cafe_name:    cafe.name,
      yelp_id:      cafe.id,
      rating:       this.rating,
      review_text:  this.reviewText,
      date_visited: this.dateVisited,
      companions:   this.companions,
      best_dish:    this.bestDish,
      is_visited:   this.isVisited,
      is_public:    this.isPublic,
      category,
      address,
      image_url:    cafe.image_url ?? ''
    };

    this.cafeService.createReview(payload).subscribe({
      next: () => {
        this.success = '✅ Your review has been saved!';
        this.loading = false;
        setTimeout(() => this.onSaved.emit(), 1200);
      },
      error: (err) => {
        this.error   = err.message;
        this.loading = false;
      }
    });
  }

  private submitUpdate(): void {
    const payload = {
      rating:       this.rating,
      review_text:  this.reviewText,
      date_visited: this.dateVisited,
      companions:   this.companions,
      best_dish:    this.bestDish,
      is_visited:   this.isVisited,
      is_public:    this.isPublic
    };

    this.cafeService.updateReview(this.editReview()._id, payload).subscribe({
      next: () => {
        this.success = '✅ Review updated!';
        this.loading = false;
        setTimeout(() => this.onSaved.emit(), 1200);
      },
      error: (err) => {
        this.error   = err.message;
        this.loading = false;
      }
    });
  }

  cancel(): void {
    this.onCancel.emit();
  }
}