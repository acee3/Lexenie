import { Component, Input, Output, EventEmitter, HostBinding } from '@angular/core';

@Component({
  selector: 'modal',
  standalone: true,
  templateUrl: './modal.component.html',
})
export class ModalComponent {
  @HostBinding('class') get hostClasses() {
    return this.isVisible
      ? 'fixed inset-0 flex items-center justify-center z-50'
      : 'hidden';
  }
  
  @Input() isVisible: boolean = false;
  @Output() close = new EventEmitter<void>();

  onClose() {
    this.close.emit();
  }
}