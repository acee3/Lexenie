import { Component, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LanguageText, LanguageTexts } from './core/language-text';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html'
})
export class AppComponent {
  backgroundText = [
    "Aprender a Hablar", // Spanish
    "Apprendre à Parler", // French
    "Lernen zu Sprechen", // German
    "Imparare a Parlare", // Italian
    "学会说话", // Mandarin
    "學會說話", // Cantonese
    "話すことを学ぶ", // Japanese
    "Learn to Speak" // English
  ];

  backgroundRows: LanguageTexts[];

  constructor() {
    this.backgroundRows = [];
    for (let i = 0; i < this.backgroundText.length; i++) {
      this.backgroundRows[i] = {id: i, languageTexts: []};
      for (let j = 0; j < this.backgroundText.length; j++) {
        this.backgroundRows[i].languageTexts[j] = {id: j, text: this.backgroundText[(i + j) % this.backgroundText.length]};
        this.backgroundRows[i].languageTexts[j + this.backgroundText.length] = {id: j + this.backgroundText.length, text: this.backgroundText[(i + j) % this.backgroundText.length]};
      }
    }
  }
}
