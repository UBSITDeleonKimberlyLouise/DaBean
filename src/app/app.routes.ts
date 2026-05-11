// ============================================
// Bean There, Done That — App Routing (Standalone)
// Author: [Student Name]
// Date: 2025
// Assignment: Cafe Tracker Application
// ============================================

import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Dashboard } from './components/dashboard/dashboard';
import { Search } from './components/search/search';


export const routes: Routes = [
  // ── Public routes ────────────────────────────────────────────────────────
  { path: '',          component: Home,      title: 'Bean There, Done That' },
  { path: 'dashboard', component: Dashboard, title: 'Discover — Bean There' },

  { path: '**', redirectTo: '' }
];