import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CafeService } from '../../services/cafe.service';
import * as L from 'leaflet';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard implements OnInit {
  private cafeService = inject(CafeService);
  private route = inject(ActivatedRoute);
  private map!: L.Map;

  activeTab = 'feed';
  publicReviews: any[] = [];
  loading = true;
  logLoading = false;
  searched = false;
  errorMsg = '';
  logError = '';
  logSuccess = false;

  searchTerm = '';
  searchLocation = 'Baguio City';
  sortBy = 'best_match';
  businesses: any[] = [];

  log = {
    cafe_name: '',
    rating: 5,
    review_text: '',
    best_dish: '',
    date_visited: '',
    companions: ''
  };

  ngOnInit(): void {
    this.loadReviews(); // Fetch data first
    
    this.route.queryParams.subscribe(params => {
      if (params['tab']) {
        this.setTab(params['tab']);
      }
    });
  }

  setTab(tab: string): void {
    this.activeTab = tab;
    if (tab === 'feed') {
      // Small delay allows Angular to render the div id="map" 
      // before Leaflet tries to find it.
      setTimeout(() => this.initMap(), 250);
    }
  }

  private initMap(): void {
  const mapContainer = document.getElementById('map');
  if (!mapContainer) return;

  if (this.map) {
    this.map.remove();
  }

  // Initialize
  this.map = L.map('map').setView([16.4023, 120.5960], 13);
  
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(this.map);

  // Force a resize check after a tiny delay
  setTimeout(() => {
    this.map.invalidateSize();
  }, 300);

  this.addMarkersToMap();
}

  loadReviews(): void {
    this.loading = true;
    this.cafeService.getPublicReviews().subscribe({
      next: (data) => {
        this.publicReviews = data;
        this.loading = false;
        // Only initialize map if we are currently looking at the feed
        if (this.activeTab === 'feed') {
          setTimeout(() => this.initMap(), 100);
        }
      },
      error: () => {
        this.errorMsg = 'Failed to load community feed.';
        this.loading = false;
      }
    });
  }

  searchCafes(): void {
    this.loading = true;
    this.searched = true;
    this.cafeService.searchCafes(this.searchTerm, this.searchLocation).subscribe({
      next: (data: any[]) => {
        this.businesses = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  submitLog(): void {
    this.logLoading = true;
    this.logError = '';
    this.logSuccess = false;

    this.cafeService.createReview(this.log).subscribe({
      next: () => {
        this.log = { 
          cafe_name: '', rating: 5, review_text: '', 
          best_dish: '', date_visited: '', companions: '' 
        };
        this.logLoading = false;
        this.logSuccess = true;
        
        // Wait 1.5s to show success message then switch back to feed
        setTimeout(() => this.setTab('feed'), 1500);
      },
      error: () => {
        this.logLoading = false;
        this.logError = 'Failed to save log.';
      }
    });
  }

  useMyLocation(): void {
    if (navigator.geolocation && this.map) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        this.map.setView([latitude, longitude], 15);
        L.marker([latitude, longitude]).addTo(this.map).bindPopup('You are here').openPopup();
      });
    }
  }

  private addMarkersToMap(): void {
    if (!this.map) return;

    this.publicReviews.forEach(review => {
      if (review.lat && review.lng) {
        L.marker([review.lat, review.lng])
          .addTo(this.map)
          .bindPopup(`<b>${review.cafe_name}</b>`);
      }
    });
  }

  getRatingStars(rating: number): string {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  }
}