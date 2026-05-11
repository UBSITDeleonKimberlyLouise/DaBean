import { Component, inject, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CafeService } from '../../services/cafe.service';
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

  // ── Map State ──────────────────────────────────────────
  private map!: L.Map;
  private markersLayer = L.layerGroup();

  // ── UI State ───────────────────────────────────────────
  publicReviews: any[] = [];
  activeTab = 'public';
  loading = false;
  searched = false;
  error = '';

  // ── Search State ───────────────────────────────────────
  searchTerm = '';
  searchLocation = 'Baguio City';
  businesses: any[] = [];

  // ── Add Log State ──────────────────────────────────────
  log = {
    cafe_name: '',
    rating: 5,
    review_text: '',
    best_dish: '',
    date_visited: '',
    companions: ''
  };
  logLoading = false;
  logSuccess = false;
  logError = '';

  ngOnInit(): void {
    this.loadPublicReviews();
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  // ── Leaflet Map Logic ──────────────────────────────────
  private initMap(): void {
    if (this.map) return;

    // Default view set to Baguio City
    this.map = L.map('cafe-map').setView([16.4023, 120.5960], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    this.markersLayer.addTo(this.map);
  }

  private updateMapMarkers(): void {
    this.markersLayer.clearLayers();
    const coords: L.LatLngTuple[] = [];

    this.businesses.forEach(b => {
      if (b.lat && b.lon) {
        const markerCoords: L.LatLngTuple = [b.lat, b.lon];
        coords.push(markerCoords);
        
        L.marker(markerCoords)
          .addTo(this.markersLayer)
          .bindPopup(`<strong>${b.name}</strong><br>${b.address}`);
      }
    });

    if (coords.length > 0) {
      this.map.fitBounds(coords, { padding: [50, 50] });
    }
  }

  // ── Action Methods ─────────────────────────────────────
  searchCafes(): void {
    if (!this.searchTerm.trim()) return;
    
    this.loading = true;
    this.searched = true;
    this.error = '';

    this.cafeService.searchCafes(this.searchTerm, this.searchLocation).subscribe({
      next: (results) => {
        // Map OpenStreetMap data to our local business format
        this.businesses = results.map(item => ({
          name: item.display_name.split(',')[0],
          address: item.display_name,
          lat: parseFloat(item.lat),
          lon: parseFloat(item.lon)
        }));

        this.updateMapMarkers();
        this.loading = false;
        
        if (this.businesses.length === 0) {
          this.error = 'No cafes found in that area.';
        }
      },
      error: () => {
        this.error = 'Search failed. Please try again.';
        this.loading = false;
      }
    });
  }

  loadPublicReviews(): void {
    this.cafeService.getPublicReviews().subscribe({
      next: (data) => {
        this.publicReviews = Array.isArray(data) ? data : [];
      },
      error: () => {
        console.error('Could not load feed.');
      }
    });
  }

  submitLog(): void {
    if (!this.log.cafe_name) {
      this.logError = 'Please enter a cafe name.';
      return;
    }

    this.logLoading = true;
    this.logError = '';

    this.cafeService.createReview({ ...this.log, is_public: true }).subscribe({
      next: () => {
        this.logLoading = false;
        this.logSuccess = true;
        this.loadPublicReviews();
        
        // Reset form and switch back to feed after a short delay
        setTimeout(() => {
          this.logSuccess = false;
          this.setTab('public');
          this.log = {
            cafe_name: '',
            rating: 5,
            review_text: '',
            best_dish: '',
            date_visited: '',
            companions: ''
          };
        }, 1500);
      },
      error: (err) => {
        this.logError = 'Failed to save log.';
        this.logLoading = false;
      }
    });
  }

  // ── UI Helpers ─────────────────────────────────────────
  setTab(tab: string): void {
    this.activeTab = tab;
    
    // Crucial: When returning to 'public', refresh the map size
    if (tab === 'public') {
      this.loadPublicReviews();
      setTimeout(() => {
        if (this.map) {
          this.map.invalidateSize();
        }
      }, 100);
    }
  }

  getRatingStars(rating: number): string {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  }
}