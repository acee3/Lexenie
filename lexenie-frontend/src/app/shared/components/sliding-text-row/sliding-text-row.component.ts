import { Component, Input } from '@angular/core';

@Component({
  selector: 'sliding-text-row',
  standalone: true,
  imports: [],
  templateUrl: './sliding-text-row.component.html'
})
export class SlidingTextRowComponent {
  @Input() texts: string[] = [];
  @Input() startingIndex = 0;
  @Input() movingLeft = true;

  indexedTexts: LanguageText[] = [];

  ngOnInit() {
    for (let i = 0; i < this.texts.length; i++) {
      this.indexedTexts[i] = { id: i, text: this.texts[(i + this.startingIndex) % this.texts.length] };
      this.indexedTexts[i + this.texts.length] = { id: i + this.texts.length, text: this.texts[(i + this.startingIndex) % this.texts.length] };
    }
  }
}

interface LanguageText {
  id: number;
  text: string;
}