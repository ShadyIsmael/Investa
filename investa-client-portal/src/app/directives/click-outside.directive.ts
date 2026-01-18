import { Directive, ElementRef, Output, EventEmitter } from '@angular/core';

@Directive({
  selector: '[clickOutside]',
  standalone: true,
  host: {
    '(document:click)': 'onClick($event)'
  }
})
export class ClickOutsideDirective {
  @Output() clickOutside = new EventEmitter<MouseEvent>();

  constructor(private elementRef: ElementRef) {}

  public onClick(event: MouseEvent): void {
    const clickedInside = this.elementRef.nativeElement.contains(event.target as Node);
    if (!clickedInside) {
      this.clickOutside.emit(event);
    }
  }
}
