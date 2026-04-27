// ============================================
// Bean There, Done That — Review Card Component
// Author: [Student Name]
// Date: 2025
// Assignment: Cafe Tracker Application
// ============================================

import { Component, input, output } from '@angular/core';

@Component({
  selector:    'app-review-card',
  templateUrl: './review-card.html',
  styleUrls:   ['./review-card.css']
})
export class ReviewCard {

  review   = input<any>();
  onEdit   = output<any>();
  onDelete = output<string>();

  /** Returns an array of length 5 for star rendering */
  getStars(rating: number): { filled: boolean }[] {
    return Array.from({ length: 5 }, (_, i) => ({ filled: i < rating }));
  }

  /** Format ISO date to a friendly string */
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
    this.onEdit.emit(this.review());
  }

  emitDelete(): void {
    this.onDelete.emit(this.review()._id);
  }
}