import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class CafeService {

  private readonly apiUrl = 'https://bean-there-api.onrender.com/api';

  constructor(
    private http:        HttpClient,
    private authService: AuthService
  ) {}

  // ── Yelp Search (via backend proxy) ───────────────────────────────────────

  searchCafes(term: string, location: string): Observable<any> {
    const params = new HttpParams()
      .set('term',     term     || 'coffee')
      .set('location', location || 'Manila');

    return this.http
      .get(`${this.apiUrl}/search`, { params })
      .pipe(catchError(this.handleError));
  }

  // ── Public Review Feed ────────────────────────────────────────────────────

  getPublicReviews(filters?: { rating?: number; type?: string }): Observable<any> {
    let params = new HttpParams();
    if (filters?.rating) { params = params.set('rating', filters.rating.toString()); }
    if (filters?.type)   { params = params.set('type', filters.type); }

    return this.http
      .get(`${this.apiUrl}/reviews/public`, { params })
      .pipe(catchError(this.handleError));
  }

  // ── Protected: User's Own Reviews ─────────────────────────────────────────

  getMyReviews(): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    return this.http
      .get(`${this.apiUrl}/reviews/mine`, { headers })
      .pipe(catchError(this.handleError));
  }

  getReviewById(id: string): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    return this.http
      .get(`${this.apiUrl}/reviews/${id}`, { headers })
      .pipe(catchError(this.handleError));
  }

  createReview(payload: {
    cafe_name:    string;
    yelp_id:      string;
    rating:       number;
    review_text:  string;
    date_visited: string;
    companions:   string;
    best_dish:    string;
    is_visited:   boolean;
    is_public:    boolean;
    category:     string;
    address:      string;
    image_url:    string;
  }): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    return this.http
      .post(`${this.apiUrl}/reviews`, payload, { headers })
      .pipe(catchError(this.handleError));
  }

  updateReview(id: string, payload: Partial<{
    rating:       number;
    review_text:  string;
    date_visited: string;
    companions:   string;
    best_dish:    string;
    is_visited:   boolean;
    is_public:    boolean;
  }>): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    return this.http
      .put(`${this.apiUrl}/reviews/${id}`, payload, { headers })
      .pipe(catchError(this.handleError));
  }

  deleteReview(id: string): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    return this.http
      .delete(`${this.apiUrl}/reviews/${id}`, { headers })
      .pipe(catchError(this.handleError));
  }

  // ── User Badges ───────────────────────────────────────────────────────────

  getUserBadges(): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    return this.http
      .get(`${this.apiUrl}/users/badges`, { headers })
      .pipe(catchError(this.handleError));
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private handleError(err: any): Observable<never> {
    const message = err?.error?.message || 'Something went wrong. Please try again.';
    return throwError(() => new Error(message));
  }
}