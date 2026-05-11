import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CafeService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000'; 

  searchCafes(query: string, location: string): Observable<any[]> {
    // 1. Combine query for better OSM results
    const fullQuery = `${query} ${location}`;
    
    // 2. Nominatim is very strict. We add &addressdetails=1 and a limit.
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(fullQuery)}&format=jsonv2&addressdetails=1&limit=15`;
    
    // 3. We try to provide a header. If your browser blocks 'User-Agent', 
    // it will at least send the 'Origin' which Nominatim uses to verify requests.
    return this.http.get<any[]>(url);
  }

  // --- MongoDB Review Methods ---
  getPublicReviews(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/reviews/public`);
  }

  createReview(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/reviews`, this.formatPayload(data));
  }

  updateReview(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/reviews/${id}`, this.formatPayload(data));
  }

  deleteReview(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/reviews/${id}`);
  }

  private formatPayload(data: any) {
    return {
      cafe_name: data.cafe_name,
      rating: Number(data.rating),
      review_text: data.review_text || '',
      date_visited: data.date_visited || new Date().toISOString().split('T')[0],
      companions: data.companions || '',
      best_dish: data.best_dish || '',
      is_public: true,
      address: data.address || 'Baguio City'
    };
  }
}