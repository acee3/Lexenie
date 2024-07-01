import { Component } from '@angular/core';
import { SlidingTextRowsComponent } from '../../shared/components/sliding-text-rows/sliding-text-rows.component';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'landing-page',
  standalone: true,
  imports: [SlidingTextRowsComponent, RouterOutlet, RouterLink],
  templateUrl: './landing-page.component.html'
})
export class LandingPageComponent {
  
  
  constructor() {

  }
}