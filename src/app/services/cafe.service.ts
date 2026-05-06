import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError, map } from 'rxjs';

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

  private readonly apiUrl      = 'https://bean-there-api.onrender.com/api';
  private readonly overpassUrl = 'https://overpass-api.de/api/interpreter';

  // Baguio City center coordinates
  private readonly DEFAULT_LAT = 16.4023;
  private readonly DEFAULT_LNG = 120.5960;
  private readonly DEFAULT_RADIUS = 5000; // meters

  constructor(private http: HttpClient) {}

  searchCafes(options: YelpSearchOptions): Observable<YelpSearchResponse> {
    const lat    = options.latitude  ?? this.DEFAULT_LAT;
    const lng    = options.longitude ?? this.DEFAULT_LNG;
    const radius = 5000;
    const term   = (options.term ?? '').toLowerCase();

    // Build Overpass query for cafes/restaurants in area
    const query = `
      [out:json][timeout:25];
      (
        node["amenity"="cafe"](around:${radius},${lat},${lng});
        node["amenity"="restaurant"](around:${radius},${lat},${lng});
        node["amenity"="bakery"](around:${radius},${lat},${lng});
        node["shop"="coffee"](around:${radius},${lat},${lng});
      );
      out body;
    `;

    return this.http
      .post(this.overpassUrl, query, { responseType: 'text' })
      .pipe(
        map((raw: string) => {
          const data = JSON.parse(raw);
          let elements = data.elements ?? [];

          // Filter by term if provided
          if (term) {
            elements = elements.filter((el: any) => {
              const name = (el.tags?.name ?? '').toLowerCase();
              const cuisine = (el.tags?.cuisine ?? '').toLowerCase();
              return name.includes(term) || cuisine.includes(term);
            });
          }

          const businesses: YelpBusiness[] = elements.map((el: any) => ({
            id:           String(el.id),
            name:         el.tags?.name ?? 'Unnamed Cafe',
            image_url:    '',
            url:          el.tags?.website ?? `https://www.openstreetmap.org/node/${el.id}`,
            review_count: 0,
            rating:       0,
            price:        '',
            location: {
              address1:        el.tags?.['addr:street'] ?? '',
              city:            el.tags?.['addr:city']   ?? 'Baguio City',
              state:           'Benguet',
              zip_code:        el.tags?.['addr:postcode'] ?? '',
              display_address: [
                el.tags?.['addr:housenumber'] && el.tags?.['addr:street']
                  ? `${el.tags['addr:housenumber']} ${el.tags['addr:street']}`
                  : el.tags?.['addr:street'] ?? '',
                el.tags?.['addr:city'] ?? 'Baguio City'
              ].filter(Boolean)
            },
            phone:         el.tags?.phone         ?? '',
            display_phone: el.tags?.phone         ?? '',
            distance:      this.calcDistance(lat, lng, el.lat, el.lon),
            categories: [
              { alias: el.tags?.amenity ?? 'cafe', title: this.formatCategory(el.tags?.amenity, el.tags?.cuisine) }
            ]
          }));

          // Sort
          if (options.sort_by === 'distance') {
            businesses.sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));
          } else {
            businesses.sort((a, b) => a.name.localeCompare(b.name));
          }

          return {
            businesses: businesses.slice(0, options.limit ?? 20),
            total:      businesses.length,
            region:     { center: { latitude: lat, longitude: lng } }
          };
        }),
        catchError(this.handleError)
      );
  }

  getCafeDetails(osmId: string): Observable<YelpBusiness> {
    const query = `[out:json];node(${osmId});out body;`;
    return this.http
      .post(this.overpassUrl, query, { responseType: 'text' })
      .pipe(
        map((raw: string) => {
          const el = JSON.parse(raw).elements[0];
          return {
            id:           String(el.id),
            name:         el.tags?.name ?? 'Unnamed Cafe',
            image_url:    '',
            url:          el.tags?.website ?? `https://www.openstreetmap.org/node/${el.id}`,
            review_count: 0,
            rating:       0,
            location: {
              address1:        el.tags?.['addr:street'] ?? '',
              city:            el.tags?.['addr:city']   ?? 'Baguio City',
              state:           'Benguet',
              zip_code:        '',
              display_address: [el.tags?.['addr:street'] ?? 'Baguio City']
            },
            phone:         el.tags?.phone ?? '',
            display_phone: el.tags?.phone ?? '',
            categories:    [{ alias: 'cafe', title: 'Cafe' }]
          };
        }),
        catchError(this.handleError)
      );
  }

  getPublicReviews(filters?: { rating?: number; type?: string }): Observable<any> {
    let params = new HttpParams();
    if (filters?.rating) { params = params.set('rating', filters.rating.toString()); }
    if (filters?.type)   { params = params.set('type',   filters.type); }

    return this.http
      .get(`${this.apiUrl}/reviews/public`, { params })
      .pipe(catchError(this.handleError));
  }

  getMyReviews(): Observable<any> {
    return this.http
      .get(`${this.apiUrl}/reviews/mine`)
      .pipe(catchError(this.handleError));
  }

  getReviewById(id: string): Observable<any> {
    return this.http
      .get(`${this.apiUrl}/reviews/${id}`)
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
    return this.http
      .post(`${this.apiUrl}/reviews`, payload)
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
    return this.http
      .put(`${this.apiUrl}/reviews/${id}`, payload)
      .pipe(catchError(this.handleError));
  }

  deleteReview(id: string): Observable<any> {
    return this.http
      .delete(`${this.apiUrl}/reviews/${id}`)
      .pipe(catchError(this.handleError));
  }

  getUserBadges(): Observable<any> {
    return this.http
      .get(`${this.apiUrl}/users/badges`)
      .pipe(catchError(this.handleError));
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  private calcDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R  = 6371000;
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lng2 - lng1) * Math.PI / 180;
    const a  = Math.sin(Δφ/2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ/2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  private formatCategory(amenity?: string, cuisine?: string): string {
    if (cuisine) return cuisine.charAt(0).toUpperCase() + cuisine.slice(1);
    const map: Record<string, string> = {
      cafe:       'Cafe',
      restaurant: 'Restaurant',
      bakery:     'Bakery',
      coffee:     'Coffee Shop'
    };
    return map[amenity ?? ''] ?? 'Cafe';
  }

  private handleError(err: any): Observable<never> {
    const message = err?.error?.message || 'Something went wrong. Please try again.';
    return throwError(() => new Error(message));
  }
}