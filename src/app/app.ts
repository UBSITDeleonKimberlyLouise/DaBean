import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router'; // <--- 1. Must import this for <router-outlet>
import { Navbar } from './components/navbar/navbar';


@Component({
  selector: 'app-root',
  standalone: true, // This confirms you are using the new Standalone style
  imports: [CommonModule, RouterOutlet, Navbar],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  title = 'DaBean';
}