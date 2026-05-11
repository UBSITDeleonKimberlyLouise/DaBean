import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { CafeService } from '../../services/cafe.service';

@Component({
  selector:    'app-home',
  standalone:  true,
  imports:     [CommonModule, FormsModule, RouterLink],
  templateUrl: './home.html',
  styleUrls:   ['./home.css']
})
export class Home {
  private cafeService = inject(CafeService);
  private router = inject(Router);

  readonly features = [
    {
      icon:  '🔍',
      title: 'Discover Cafes',
      desc:  'Instantly search for coffee spots near you using live data. No account needed—just browse and find your next caffeine fix.'
    },
    {
      icon:  '✍️',
      title: 'Anonymous Reviews',
      desc:  'Share your experience without the hassle of signing up. Drop a rating, mention the best dish, and help others find the best brews.'
    },
    {
      icon:  '🌍',
      title: 'Community Feed',
      desc:  'See what the community is saying in real-time. An open board of cafe visits from fellow coffee lovers everywhere.'
    },
    {
      icon:  '📍',
      title: 'Leaflet Mapping',
      desc:  'Pinpoint exact locations with our interactive map. Whether you are in Baguio or Manila, find exactly where the beans are.'
    }
  ];

  searchLocation = '';
  searchTerm     = '';
  
  businesses: any[] = [];
  isLoading   = false;
  hasSearched = false;
  errorMsg    = '';

  currentPage       = 0;
  readonly pageSize = 10;
  totalResults      = 0;

  get totalPages(): number { return Math.ceil(this.totalResults / this.pageSize); }

  onSearch(): void {
    if (!this.searchLocation.trim()) {
      this.errorMsg = 'Please enter a city or address to search.';
      return;
    }
    this.fetchCafes();
  }

  useMyLocation(): void {
    if (!navigator.geolocation) {
      this.errorMsg = 'Geolocation is not supported by your browser.';
      return;
    }

    this.isLoading = true;
    this.errorMsg  = '';

    navigator.geolocation.getCurrentPosition(
      pos => {
        this.searchLocation = `${pos.coords.latitude},${pos.coords.longitude}`;
        this.fetchCafes();
      },
      () => {
        this.isLoading = false;
        this.errorMsg  = 'Could not get your location. Please enter it manually.';
      }
    );
  }

  private fetchCafes(): void {
    this.isLoading   = true;
    this.errorMsg    = '';
    this.hasSearched = true;
    this.cafeService.searchCafes(this.searchTerm || 'cafe', this.searchLocation).subscribe({
      next: (res: any[]) => {
        this.businesses = res.map(item => ({
          name: item.display_name.split(',')[0],
          address: item.display_name,
          lat: parseFloat(item.lat),
          lon: parseFloat(item.lon)
        }));
        this.totalResults = this.businesses.length;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.errorMsg = 'Search failed. Please try again.';
      }
    });
  }

  getRatingStars(rating: number = 5): string {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  }
}