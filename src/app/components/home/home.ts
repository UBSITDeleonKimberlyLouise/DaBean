// ============================================
// Bean There, Done That — Home Component
// Author: [Student Name]
// Date: 2025
// Assignment: Cafe Tracker Application
// ============================================

import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector:    'app-home',
  templateUrl: './home.html',
  styleUrls:   ['./home.css']
})
export class Home {

  private authService = inject(AuthService);

  isLoggedIn = false;

  readonly features = [
    {
      icon:  '🔍',
      title: 'Search & Discover',
      desc:  'Find cafes and restaurants near you using real Yelp data — names, photos, and categories all in one place.'
    },
    {
      icon:  '⭐',
      title: 'Rate Your Experience',
      desc:  'Log your visit with a 1–5 star rating, who you went with, the best dish you tried, and personal notes.'
    },
    {
      icon:  '📋',
      title: 'Visited & Wishlist',
      desc:  'Keep two separate lists — places you\'ve already been, and places you\'re dreaming of going next.'
    },
    {
      icon:  '🏆',
      title: 'Earn Badges',
      desc:  'Get rewarded for your logging habits. Visit 5 cafes in one city and earn the "Local Expert" badge!'
    }
  ];

  constructor() {
    this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
    });
  }
}