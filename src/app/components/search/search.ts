import { Component, inject } from '@angular/core';
import { CafeService } from '../../services/cafe.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReviewForm } from '../review-form/review-form';


@Component({
  selector:    'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule, ReviewForm],
  templateUrl: './search.html',
  styleUrls:   ['./search.css']
})
export class Search {

  private cafeService = inject(CafeService);

  searchTerm      = '';
  searchLocation  = '';
  results:  any[] = [];
  loading         = false;
  error           = '';
  searched        = false;

  // The cafe picked to be logged
  selectedCafe:    any    = null;
  showReviewForm         = false;

  // ── Search ────────────────────────────────────────────────────────────────

  search(): void {
    if (!this.searchTerm && !this.searchLocation) {
      this.error = 'Please enter a cafe name or location.';
      return;
    }

    this.loading  = true;
    this.error    = '';
    this.searched = true;
    this.results  = [];
    this.selectedCafe  = null;
    this.showReviewForm = false;

    this.cafeService
      .searchCafes({ term: this.searchTerm, location: this.searchLocation })
      .subscribe({
        next: (data) => {
          this.results = data.businesses ?? data ?? [];
          this.loading = false;
        },
        error: (err) => {
          this.error   = err.message;
          this.loading = false;
        }
      });
  }

  // ── Select a result to log ────────────────────────────────────────────────

  selectCafe(business: any): void {
    this.selectedCafe   = business;
    this.showReviewForm = true;

    // Smooth-scroll to the form
    setTimeout(() => {
      const el = document.getElementById('review-form-anchor');
      if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    }, 80);
  }

  // ── After review saved ────────────────────────────────────────────────────

  onReviewSaved(): void {
    this.showReviewForm = false;
    this.selectedCafe   = null;
    this.results        = [];
    this.searched       = false;
    this.searchTerm     = '';
    this.searchLocation = '';
  }

  onCancelForm(): void {
    this.showReviewForm = false;
    this.selectedCafe   = null;
  }

  /** Extract primary category label from Yelp categories array */
  getCategoryLabel(categories: any[]): string {
    if (!categories || categories.length === 0) { return ''; }
    return categories.map(c => c.title).join(', ');
  }

  /** Extract price range or return empty */
  getPriceLabel(price: string): string {
    return price ?? '';
  }
}