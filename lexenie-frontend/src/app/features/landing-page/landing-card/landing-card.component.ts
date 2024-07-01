import { Component, HostListener } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'landing-card',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './landing-card.component.html',
  host: {
    class: "backdrop-blur-[6px] bg-translucentWhite shadow-dark-theme min-h-fit min-w-fit h-[66%] w-[40%] mb-12"
  }
})
export class LandingCardComponent {}
