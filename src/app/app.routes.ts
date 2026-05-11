import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Register } from './components/register/register';
import { Dashboard } from './components/dashboard/dashboard';
import { Search } from './components/search/search';


export const routes: Routes = [
  { path: '',          component: Home,      title: 'Bean There, Done That' },
  { path: 'register',  component: Register,  title: 'Sign Up — Bean There'  },
  { path: 'dashboard', component: Dashboard, title: 'Discover — Bean There' },

  { path: '**', redirectTo: '' }
];