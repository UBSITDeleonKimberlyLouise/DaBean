import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-review-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './review-card.html',
  styleUrls: ['./review-card.css']
})
export class ReviewCard {
  review   = input<any>();
  isOwner  = input<boolean>(false);
  onEdit   = output<any>();
  onDelete = output<string>();

  getStars(rating: number): { filled: boolean }[] {
    return Array.from({ length: 5 }, (_, i) => ({ filled: i < rating }));
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-PH', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  }

  emitEdit(): void   { this.onEdit.emit(this.review()); }
  emitDelete(): void { this.onDelete.emit(this.review()._id); }
}