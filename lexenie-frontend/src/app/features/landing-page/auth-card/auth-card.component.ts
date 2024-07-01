import { NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'auth-card',
  standalone: true,
  imports: [RouterOutlet, RouterLink, NgOptimizedImage],
  templateUrl: './auth-card.component.html',
  host: {
    class: "backdrop-blur-[6px] bg-translucentWhite shadow-dark-theme min-h-fit min-w-fit w-[40%] mb-12"
  }
})
export class AuthCardComponent {}
