import { Component } from '@angular/core';
import { CafeService } from '../cafe.service';

@Component({
  selector:    'app-search',
  templateUrl: './search.component.html',
  styleUrls:   ['./search.component.css']
})
export class SearchComponent {

  searchTerm      = '';
  searchLocation  = '';
  results:  any[] = [];
  loading         = false;
  error           = '';
  searched        = false;

  selectedCafe:    any    = null;
  showReviewForm         = false;

  constructor(private cafeService: CafeService) {}


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
      .searchCafes(this.searchTerm, this.searchLocation)
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

  selectCafe(business: any): void {
    this.selectedCafe   = business;
    this.showReviewForm = true;

    setTimeout(() => {
      const el = document.getElementById('review-form-anchor');
      if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    }, 80);
  }

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

  getCategoryLabel(categories: any[]): string {
    if (!categories || categories.length === 0) { return ''; }
    return categories.map(c => c.title).join(', ');
  }

  getPriceLabel(price: string): string {
    return price ?? '';
  }
}
