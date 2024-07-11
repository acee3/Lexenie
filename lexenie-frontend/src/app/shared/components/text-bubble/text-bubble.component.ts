import { Component, Input } from '@angular/core';

@Component({
  selector: 'text-bubble',
  standalone: true,
  imports: [],
  templateUrl: './text-bubble.component.html',
})
export class TextBubbleComponent {
  @Input() text: string = '';
  @Input() isUser: boolean = false;
}
