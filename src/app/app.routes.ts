import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Dashboard } from './components/dashboard/dashboard';
import { Search } from './components/search/search';


export const routes: Routes = [
  { path: '',          component: Home,      title: 'Bean There, Done That' },
  { path: 'dashboard', component: Dashboard, title: 'Discover — Bean There' },

  { path: '**', redirectTo: '' }
];