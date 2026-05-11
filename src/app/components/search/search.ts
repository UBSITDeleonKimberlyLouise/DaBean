import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CafeService } from '../../services/cafe.service';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './search.html',
  styleUrls: ['./search.css']
})
export class Search {
  private cafeService = inject(CafeService);

  searchTerm = '';
  searchLocation = 'Baguio City';
  results: any[] = [];
  isLoading = false;
  hasSearched = false;
  errorMsg = '';

  onSearch(): void {
    if (!this.searchTerm.trim()) {
      this.errorMsg = 'Please enter a cafe name';
      return;
    }

    console.log('Attempting search for:', this.searchTerm); // DEBUG
    this.isLoading = true;
    this.hasSearched = true;
    this.errorMsg = '';

    this.cafeService.searchCafes(this.searchTerm, this.searchLocation).subscribe({
      next: (data) => {
        console.log('Data received:', data); // DEBUG
        this.results = data || [];
        this.isLoading = false;
        if (this.results.length === 0) {
          this.errorMsg = 'No spots found. Try a broader search term.';
        }
      },
      error: (err) => {
        console.error('API Error:', err); // DEBUG
        this.isLoading = false;
        this.errorMsg = 'The search service is currently unavailable (CORS or Policy block).';
      }
    });
  }

  getRatingStars(rating: number = 5): string {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  }
}