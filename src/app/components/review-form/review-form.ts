import { Component, input, output, effect, inject } from '@angular/core';
import { CafeService } from '../../services/cafe.service';

@Component({
  selector:    'app-review-form',
  templateUrl: './review-form.html',
  styleUrls:   ['./review-form.css']
})
export class ReviewForm {

  private cafeService = inject(CafeService);

  // ── Inputs (signals) ─────────────────────────────
  selectedCafe = input<any>(null);
  editReview   = input<any>(null);

  // ── Outputs ──────────────────────────────────────
  onSaved  = output<void>();
  onCancel = output<void>();

  // ── Form fields ──────────────────────────────────
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
    effect(() => {
      const review = this.editReview();

      if (review) {
        this.rating      = review.rating ?? 0;
        this.reviewText  = review.review_text ?? '';
        this.dateVisited = review.date_visited
          ? review.date_visited.substring(0, 10)
          : '';
        this.companions  = review.companions ?? '';
        this.bestDish    = review.best_dish ?? '';
        this.isVisited   = review.is_visited ?? true;
        this.isPublic    = review.is_public ?? true;
      }
    });
  }

  // ────────────────────────────────────────────────
  // 🔧 ADDITION (fix for your Profile workaround)
  // ────────────────────────────────────────────────

  review: any = null;

  setReview(data: any) {
    this.review = data;

    // If editing via Profile workaround, sync values
    if (data) {
      this.rating      = data.rating ?? 0;
      this.reviewText  = data.review_text ?? '';
      this.dateVisited = data.date_visited?.substring(0, 10) ?? '';
      this.companions  = data.companions ?? '';
      this.bestDish    = data.best_dish ?? '';
      this.isVisited   = data.is_visited ?? true;
      this.isPublic    = data.is_public ?? true;
    }
  }

  // ── Star interaction ─────────────────────────────

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

  // ── Submit ───────────────────────────────────────

  onSubmit(): void {
    if (!this.rating) {
      this.error = 'Please select a star rating.';
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    // Use signal OR fallback to manual setReview()
    const editMode = this.editReview() || this.review;

    if (editMode) {
      this.submitUpdate();
    } else {
      this.submitCreate();
    }
  }

  private submitCreate(): void {
    const cafe = this.selectedCafe();

    if (!cafe) {
      this.error = 'No cafe selected.';
      this.loading = false;
      return;
    }

    const address  = cafe.location?.display_address?.join(', ') ?? '';
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
        this.error = err.message;
        this.loading = false;
      }
    });
  }

  private submitUpdate(): void {
    const review = this.editReview() || this.review;

    if (!review?._id) {
      this.error = 'Missing review ID.';
      this.loading = false;
      return;
    }

    const payload = {
      rating:       this.rating,
      review_text:  this.reviewText,
      date_visited: this.dateVisited,
      companions:   this.companions,
      best_dish:    this.bestDish,
      is_visited:   this.isVisited,
      is_public:    this.isPublic
    };

    this.cafeService.updateReview(review._id, payload).subscribe({
      next: () => {
        this.success = '✅ Review updated!';
        this.loading = false;
        setTimeout(() => this.onSaved.emit(), 1200);
      },
      error: (err) => {
        this.error = err.message;
        this.loading = false;
      }
    });
  }

  cancel(): void {
    this.onCancel.emit();
  }
}