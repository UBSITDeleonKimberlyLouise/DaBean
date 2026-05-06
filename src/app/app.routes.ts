// ============================================
// Bean There, Done That — App Routing (Standalone)
// Author: [Student Name]
// Date: 2025
// Assignment: Cafe Tracker Application
// ============================================

import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Login } from './components/login/login';
import { Register } from './components/register/register';
import { Dashboard } from './components/dashboard/dashboard';
import { Search } from './components/search/search';
import { Profile } from './components/profile/profile';


export const routes: Routes = [
  // ── Public routes ────────────────────────────────────────────────────────
  { path: '',          component: Home,      title: 'Bean There, Done That' },
  { path: 'login',     component: Login,     title: 'Log In — Bean There'   },
  { path: 'register',  component: Register,  title: 'Sign Up — Bean There'  },
  { path: 'dashboard', component: Dashboard, title: 'Discover — Bean There' },

  { path: '**', redirectTo: '' }
];