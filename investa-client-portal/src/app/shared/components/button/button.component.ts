import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Type definitions for button variants
 */
type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'outline';

/**
 * Type definitions for button sizes
 */
type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * ButtonComponent
 * 
 * Reusable button component with consistent styling across the application.
 * Supports multiple variants, sizes, and states.
 * 
 * Features:
 * - Multiple variants (primary, secondary, danger, outline)
 * - Three size options (sm, md, lg)
 * - Disabled state support
 * - Full width option
 * - Keyboard accessible (focus ring)
 * - Smooth transitions
 * 
 * @example
 * // Primary button
 * <app-button (clicked)="onAction()">Click me</app-button>
 * 
 * @example
 * // Danger button, disabled
 * <app-button variant="danger" [disabled]="true">Delete</app-button>
 * 
 * @example
 * // Large outline button
 * <app-button variant="outline" size="lg" [fullWidth]="true">Learn More</app-button>
 */
@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button 
      [ngClass]="getButtonClasses()"
      (click)="clicked.emit()"
      type="button"
      [disabled]="disabled"
      class="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
    >
      <ng-content></ng-content>
    </button>
  `,
  styleUrls: ['./button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent {
  /**
   * Visual variant of the button
   * @default 'primary'
   */
  @Input() variant: ButtonVariant = 'primary';

  /**
   * Size of the button
   * @default 'md'
   */
  @Input() size: ButtonSize = 'md';

  /**
   * Whether the button is disabled
   * @default false
   */
  @Input() disabled = false;

  /**
   * Whether the button takes full width of container
   * @default false
   */
  @Input() fullWidth = false;

  /**
   * Emitted when button is clicked
   */
  @Output() clicked = new EventEmitter<void>();

  /**
   * Generates dynamic button CSS classes based on variant and size
   * @returns Array of Tailwind CSS class names
   */
  getButtonClasses(): string[] {
    // Base classes applied to all buttons
    const baseClasses = [
      'font-semibold',
      'rounded-full',
      'transition-opacity',
      'transition-colors',
      'duration-300',
      'cursor-pointer'
    ];

    // Size-specific classes
    const sizeClasses: Record<ButtonSize, string[]> = {
      sm: ['py-1', 'px-3', 'text-sm'],
      md: ['py-2', 'px-4', 'text-base'],
      lg: ['py-3', 'px-8', 'text-lg']
    };

    // Variant-specific classes
    const variantClasses: Record<ButtonVariant, string[]> = {
      primary: [
        'bg-gradient-to-r',
        'from-blue-500',
        'to-purple-600',
        'text-white',
        'hover:opacity-90'
      ],
      secondary: [
        'bg-slate-700',
        'text-white',
        'hover:bg-slate-600'
      ],
      danger: [
        'bg-red-600',
        'text-white',
        'hover:bg-red-700'
      ],
      outline: [
        'border-2',
        'border-blue-500',
        'text-blue-500',
        'hover:bg-blue-500/10'
      ]
    };

    // Combine base classes with size and variant classes
    let classes = [
      ...baseClasses,
      ...sizeClasses[this.size],
      ...variantClasses[this.variant]
    ];

    // Add disabled state classes
    if (this.disabled) {
      classes = classes.filter(cls => !cls.includes('hover'));
      classes.push('opacity-50', 'cursor-not-allowed');
    }

    // Add full width classes
    if (this.fullWidth) {
      classes.push('w-full');
    }

    return classes;
  }
}
