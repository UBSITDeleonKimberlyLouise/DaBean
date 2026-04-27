import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';  // ✅ import RouterModule
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,        // make it standalone
  imports: [RouterModule], // ✅ required for router directives
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class Navbar {
  private authService = inject(AuthService);
  private router      = inject(Router);

  currentUser: any = null;
  menuOpen = false;

  constructor() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
    this.closeMenu();
  }
}