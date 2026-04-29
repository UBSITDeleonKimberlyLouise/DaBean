import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';

export type YelpBusiness = {
  id:           string;
  name:         string;
  image_url:    string;
  url:          string;
  review_count: number;
  rating:       number;
  price?:       string;
  location: {
    address1:        string;
    city:            string;
    state:           string;
    zip_code:        string;
    display_address: string[];
  };
  phone:         string;
  display_phone: string;
  distance?:     number;
  categories:    { alias: string; title: string }[];
  hours?:        { is_open_now: boolean }[];
};

export type YelpSearchResponse = {
  businesses: YelpBusiness[];
  total:      number;
  region: {
    center: { longitude: number; latitude: number };
  };
};

export type YelpSortBy = 'best_match' | 'rating' | 'review_count' | 'distance';

export type YelpSearchOptions = {
  term?:      string;
  location?:  string;
  latitude?:  number;
  longitude?: number;
  limit?:     number;
  offset?:    number;
  sort_by?:   YelpSortBy;
  price?:     string;
  open_now?:  boolean;
};

@Injectable({ providedIn: 'root' })
export class CafeService {

  private readonly apiUrl   = 'https://bean-there-api.onrender.com/api';
  private readonly yelpBase = '/api/yelp';   // proxied → https://api.yelp.com

  constructor(
    private http:        HttpClient,
    private authService: AuthService
  ) {}

  searchCafes(options: YelpSearchOptions): Observable<YelpSearchResponse> {
    let params = new HttpParams()
      .set('categories', 'cafes,coffee')
      .set('term',       options.term    ?? 'cafe')
      .set('limit',      String(options.limit  ?? 10))
      .set('sort_by',    options.sort_by ?? 'best_match');

    if (options.location) {
      params = params.set('location', options.location);
    }
    if (options.latitude != null && options.longitude != null) {
      params = params
        .set('latitude',  String(options.latitude))
        .set('longitude', String(options.longitude));
    }
    if (options.offset != null) {
      params = params.set('offset', String(options.offset));
    }
    if (options.price) {
      params = params.set('price', options.price);
    }
    if (options.open_now) {
      params = params.set('open_now', 'true');
    }

    return this.http
      .get<YelpSearchResponse>(`${this.yelpBase}/v3/businesses/search`, { params })
      .pipe(catchError(this.handleError));
  }

  getCafeDetails(yelpId: string): Observable<YelpBusiness> {
    return this.http
      .get<YelpBusiness>(`${this.yelpBase}/v3/businesses/${yelpId}`)
      .pipe(catchError(this.handleError));
  }

  getPublicReviews(filters?: { rating?: number; type?: string }): Observable<any> {
    let params = new HttpParams();
    if (filters?.rating) { params = params.set('rating', filters.rating.toString()); }
    if (filters?.type)   { params = params.set('type', filters.type); }

    return this.http
      .get(`${this.apiUrl}/reviews/public`, { params })
      .pipe(catchError(this.handleError));
  }

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

  getUserBadges(): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    return this.http
      .get(`${this.apiUrl}/users/badges`, { headers })
      .pipe(catchError(this.handleError));
  }

  private handleError(err: any): Observable<never> {
    const message = err?.error?.message || 'Something went wrong. Please try again.';
    return throwError(() => new Error(message));
  }
}