import { Component, Input } from '@angular/core';
import { SlidingTextRowComponent } from '../sliding-text-row/sliding-text-row.component';

@Component({
  selector: 'sliding-text-rows',
  standalone: true,
  imports: [SlidingTextRowComponent],
  templateUrl: './sliding-text-rows.component.html'
})
export class SlidingTextRowsComponent {
  @Input() texts = [
    "Aprender a Hablar", // Spanish
    "Apprendre à Parler", // French
    "Lernen zu Sprechen", // German
    "Imparare a Parlare", // Italian
    "学会说话", // Mandarin
    "學會說話", // Cantonese
    "話すことを学ぶ", // Japanese
    "Learn to Speak" // English
  ];

  rowInfos: LanguageRowInfo[] = [];
  constructor() {
    for (let i = 0; i < this.texts.length; i++)
      this.rowInfos[i] = {id: i, texts: this.texts, startingIndex: i, movingLeft: i % 2 == 0};
  }
}

interface LanguageRowInfo {
  id: number;
  texts: string[];
  startingIndex: number;
  movingLeft: boolean;
}