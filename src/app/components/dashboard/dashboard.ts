import { Component, inject, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CafeService, YelpBusiness, YelpSearchOptions, YelpSortBy } from '../../services/cafe.service';
import * as L from 'leaflet';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard implements OnInit, AfterViewInit {
  private cafeService = inject(CafeService);

  private map!: L.Map;
  private markersLayer = L.layerGroup();

  publicReviews: any[] = [];
  activeTab = 'public';
  filterRating = '';
  filterType = '';

  readonly typeOptions = [
    'Coffee & Tea', 'Brunch', 'Breakfast & Brunch',
    'Cafes', 'Bakeries', 'Desserts', 'Italian', 'Asian Fusion'
  ];

  searchTerm: string = '';
  searchLocation: string = '';
  sortBy: YelpSortBy = 'best_match';
  businesses: YelpBusiness[] = [];
  searched = false;
  loading = false;
  error = '';

  log = {
    cafe_name: '',
    rating: 5,
    review_text: '',
    best_dish: '',
    date_visited: '',
    companions: '',
    is_public: true
  };
  logLoading = false;
  logError = '';
  logSuccess = false;

  ngOnInit(): void {
    this.loadPublicReviews();
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  private initMap(): void {
    if (this.map) return;
    this.map = L.map('cafe-map').setView([16.4023, 120.5960], 13);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap &copy; CARTO'
    }).addTo(this.map);

    this.markersLayer.addTo(this.map);
  }

  private updateMapMarkers(): void {
    this.markersLayer.clearLayers();
    this.businesses.forEach(biz => {
      if (biz.coordinates?.latitude && biz.coordinates?.longitude) {
        L.marker([biz.coordinates.latitude, biz.coordinates.longitude])
          .addTo(this.markersLayer)
          .bindPopup(`<strong>${biz.name}</strong><br>${biz.location.display_address.join(', ')}`);
      }
    });

    if (this.businesses.length > 0) {
      const coords = this.businesses.map(b => [b.coordinates.latitude, b.coordinates.longitude] as L.LatLngTuple);
      this.map.fitBounds(coords, { padding: [40, 40] });
    }
  }

  searchCafes(): void {
    if (!this.searchTerm && !this.searchLocation) return;
    this.loading = true;
    this.searched = true;
    this.cafeService.searchCafes({ term: this.searchTerm, location: this.searchLocation }).subscribe({
      next: (data) => {
        this.businesses = data.businesses || [];
        this.loading = false;
        this.updateMapMarkers();
      },
      error: () => this.loading = false
    });
  }

  loadPublicReviews(): void {
    this.loading = true;
    this.cafeService.getPublicReviews().subscribe({
      next: (data) => {
        this.publicReviews = Array.isArray(data) ? data : [];
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  submitLog(): void {
    if (!this.log.cafe_name) {
      this.logError = 'Please enter a cafe name';
      return;
    }
    this.logLoading = true;
    this.cafeService.createReview({ ...this.log }).subscribe({
      next: () => {
        this.logLoading = false;
        this.logSuccess = true;
        this.loadPublicReviews();
        this.log = { cafe_name: '', rating: 5, review_text: '', best_dish: '', date_visited: '', companions: '', is_public: true };
        setTimeout(() => {
          this.logSuccess = false;
          this.setTab('public');
        }, 1500);
      },
      error: (err) => {
        this.logError = err.message;
        this.logLoading = false;
      }
    });
  }

  setTab(tab: string): void {
    this.activeTab = tab;
    if (tab === 'public') {
      this.loadPublicReviews();
      // This forces the map to recalculate its size after being hidden
      setTimeout(() => {
        if (this.map) this.map.invalidateSize();
      }, 100);
    }
  }

  getRatingStars(rating: number): string {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  }

  getCategoryLabels(biz: any): string {
    return biz.categories?.map((c: any) => c.title).join(', ') || '';
  }

  getDistanceKm(meters: number): string {
    return (meters / 1000).toFixed(1) + ' km';
  }

  useMyLocation(): void {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(pos => {
      this.searchLocation = `${pos.coords.latitude},${pos.coords.longitude}`;
      this.map.setView([pos.coords.latitude, pos.coords.longitude], 14);
      this.searchCafes();
    });
  }

  applyFilters(): void { this.loadPublicReviews(); }
  clearFilters(): void {
    this.filterRating = '';
    this.filterType = '';
    this.loadPublicReviews();
  }
}