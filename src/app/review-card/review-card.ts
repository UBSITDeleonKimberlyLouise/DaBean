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
  // Using signals to match your HTML review() syntax
  review = input.required<any>();
  
  // Outputs for the buttons in the HTML
  edit = output<any>();
  delete = output<string>();

  /**
   * FIX: Added isOwner to satisfy the template compiler.
   * Since login is removed, returning 'true' allows you to see the 
   * Edit/Remove buttons and the Private/Public badges.
   */
  isOwner(): boolean {
    return true; 
  }

  getStars(rating: number) {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push({ filled: i <= rating });
    }
    return stars;
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  }

  emitEdit(): void {
    this.edit.emit(this.review());
  }

  emitDelete(): void {
    this.delete.emit(this.review()._id);
  }
}