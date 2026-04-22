import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CafeService } from '../../services/cafe.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector:    'app-review-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './review-form.html',
  styleUrls:   ['./review-form.css']
})
export class ReviewForm implements OnChanges {

  @Input()  selectedCafe: any  = null;
  @Input()  editReview:   any  = null;

  @Output() onSaved  = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();

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

  readonly isEditMode: boolean = false;

  constructor(private cafeService: CafeService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['editReview'] && this.editReview) {
      this.rating      = this.editReview.rating      ?? 0;
      this.reviewText  = this.editReview.review_text ?? '';
      this.dateVisited = this.editReview.date_visited
        ? this.editReview.date_visited.substring(0, 10)
        : '';
      this.companions  = this.editReview.companions  ?? '';
      this.bestDish    = this.editReview.best_dish   ?? '';
      this.isVisited   = this.editReview.is_visited  ?? true;
      this.isPublic    = this.editReview.is_public   ?? true;
    }
  }

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

  onSubmit(): void {
    if (!this.rating) {
      this.error = 'Please select a star rating.';
      return;
    }

    this.loading = true;
    this.error   = '';
    this.success = '';

    if (this.editReview) {
      this.submitUpdate();
    } else {
      this.submitCreate();
    }
  }

  private submitCreate(): void {
    const cafe    = this.selectedCafe;
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

    this.cafeService.updateReview(this.editReview._id, payload).subscribe({
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
