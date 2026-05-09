import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type YelpSortBy = 'best_match' | 'rating' | 'review_count' | 'distance';

export interface YelpSearchOptions {
  term?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  categories?: string;
  limit?: number;
  offset?: number;
  sort_by?: YelpSortBy;
  open_now?: boolean;
}

export interface YelpBusiness {
  id: string;
  name: string;
  image_url: string;
  rating: number;
  review_count: number;
  price?: string;
  distance?: number;
  categories: { title: string }[];
  location: { display_address: string[] };
  coordinates: { latitude: number; longitude: number };
}

@Injectable({
  providedIn: 'root'
})
export class CafeService {
  private http = inject(HttpClient);
  
  // CHANGED: Pointing to your local backend instead of the dead Render link
  private apiUrl = 'http://localhost:3000'; 

  searchCafes(options: YelpSearchOptions): Observable<any> {
    return this.http.post(`${this.apiUrl}/yelp/search`, options);
  }

  getPublicReviews(filters: any = {}): Observable<any> {
    return this.http.get(`${this.apiUrl}/reviews`, { params: filters });
  }

  createReview(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/reviews`, data);
  }

  updateReview(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/reviews/${id}`, this.formatPayload(data));
  }

  deleteReview(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/reviews/${id}`);
  }

  // Fallbacks for profile/register components
  getMyReviews(): Observable<any> { return this.getPublicReviews(); }
  getUserBadges(): Observable<any> { return this.http.get(`${this.apiUrl}/badges`); }

  private formatPayload(data: any) {
    return {
      cafe_name: data.cafe_name,
      yelp_id: data.yelp_id || 'manual-entry',
      rating: Number(data.rating),
      review_text: data.review_text || '',
      date_visited: data.date_visited || new Date().toISOString(),
      companions: data.companions || '',
      best_dish: data.best_dish || '',
      is_visited: true,
      is_public: true,
      category: data.category || 'Cafe',
      address: data.address || 'Baguio City',
      image_url: data.image_url || ''
    };
  }
}