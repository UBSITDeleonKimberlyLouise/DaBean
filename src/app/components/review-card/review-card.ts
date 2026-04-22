import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';


@Component({
  selector:    'app-review-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './review-card.html',
  styleUrls:   ['./review-card.css']
})
export class ReviewCard {

  @Input()  review:    any;
  @Input()  isOwner  = false;
  @Output() onEdit   = new EventEmitter<any>();
  @Output() onDelete = new EventEmitter<string>();

  getStars(rating: number): { filled: boolean }[] {
    return Array.from({ length: 5 }, (_, i) => ({ filled: i < rating }));
  }

  formatDate(dateStr: string): string {
    if (!dateStr) { return ''; }
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-PH', {
      year:  'numeric',
      month: 'long',
      day:   'numeric'
    });
  }

  emitEdit(): void {
    this.onEdit.emit(this.review);
  }

  emitDelete(): void {
    this.onDelete.emit(this.review._id);
  }
}
