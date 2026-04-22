import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly apiUrl    = 'https://bean-there-api.onrender.com/api';
  private readonly tokenKey  = 'bt_token';
  private readonly userKey   = 'bt_user';

  private currentUserSubject = new BehaviorSubject<any>(this.loadStoredUser());
  public currentUser$        = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  // ── Getters ────────────────────────────────────────────────────────────────

  get currentUser(): any {
    return this.currentUserSubject.value;
  }

  get isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  // ── Auth Operations ────────────────────────────────────────────────────────

  register(username: string, email: string, password: string): Observable<any> {
    return this.http
      .post(`${this.apiUrl}/auth/register`, { username, email, password })
      .pipe(
        tap((res: any) => this.persistSession(res)),
        catchError(this.handleError)
      );
  }

  login(email: string, password: string): Observable<any> {
    return this.http
      .post(`${this.apiUrl}/auth/login`, { email, password })
      .pipe(
        tap((res: any) => this.persistSession(res)),
        catchError(this.handleError)
      );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.currentUserSubject.next(null);
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  private persistSession(res: any): void {
    if (res.token) {
      localStorage.setItem(this.tokenKey, res.token);
      localStorage.setItem(this.userKey, JSON.stringify(res.user));
      this.currentUserSubject.next(res.user);
    }
  }

  private loadStoredUser(): any {
    try {
      const raw = localStorage.getItem(this.userKey);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  private handleError(err: any): Observable<never> {
    const message = err?.error?.message || 'An unexpected error occurred.';
    return throwError(() => new Error(message));
  }
}