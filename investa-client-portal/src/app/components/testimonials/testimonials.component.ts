import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { TranslatePipe } from '../../pipes/translate.pipe';

interface Testimonial {
  quoteKey: string;
  name: string;
  title: string;
  avatarUrl: string;
}

@Component({
  selector: 'app-testimonials',
  templateUrl: './testimonials.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe]
})
export class TestimonialsComponent {
  testimonials = signal<Testimonial[]>([
    {
      quoteKey: 'testimonials.sarah',
      name: 'Sarah J.',
      title: 'Day Trader',
      avatarUrl: 'https://picsum.photos/seed/person1/100/100'
    },
    {
      quoteKey: 'testimonials.michael',
      name: 'Michael B.',
      title: 'Financial Advisor',
      avatarUrl: 'https://picsum.photos/seed/person2/100/100'
    },
    {
      quoteKey: 'testimonials.jessica',
      name: 'Jessica L.',
      title: 'Tech Entrepreneur',
      avatarUrl: 'https://picsum.photos/seed/person3/100/100'
    }
  ]);
}