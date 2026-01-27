import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { TranslatePipe } from '../../pipes/translate.pipe';

interface Testimonial {
  quoteKey: string;
  nameKey: string;
  titleKey: string;
  avatarUrl: string;
}

@Component({
  selector: 'app-testimonials',
  templateUrl: './testimonials.component.html',
  styleUrls: ['./testimonials.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe]
})
export class TestimonialsComponent {
  testimonials = signal<Testimonial[]>([
    {
      quoteKey: 'testimonials.sarah',
      nameKey: 'testimonials.sarahName',
      titleKey: 'testimonials.sarahTitle',
      avatarUrl: 'https://picsum.photos/seed/person1/100/100'
    },
    {
      quoteKey: 'testimonials.michael',
      nameKey: 'testimonials.michaelName',
      titleKey: 'testimonials.michaelTitle',
      avatarUrl: 'https://picsum.photos/seed/person2/100/100'
    },
    {
      quoteKey: 'testimonials.jessica',
      nameKey: 'testimonials.jessicaName',
      titleKey: 'testimonials.jessicaTitle',
      avatarUrl: 'https://picsum.photos/seed/person3/100/100'
    }
  ]);
}