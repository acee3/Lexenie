import { Component, Input } from '@angular/core';

@Component({
  selector: 'cool-button',
  standalone: true,
  imports: [],
  templateUrl: './cool-button.component.html',
  host: {
    class: "h-fit w-fit"
  }
})
export class CoolButtonComponent {
  @Input() text: string = "";
}
