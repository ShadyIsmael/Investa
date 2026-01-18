import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { TranslatePipe } from '../../pipes/translate.pipe';

interface Pillar {
  iconPath: string;
  titleKey: string;
  descriptionKey: string;
}

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe]
})
export class AboutComponent {
  pillars = signal<Pillar[]>([
    {
      iconPath: 'M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z',
      titleKey: 'about.pillars.discover.title',
      descriptionKey: 'about.pillars.discover.description',
    },
    {
      iconPath: 'M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m-7.5-2.962c.57-1.023.57-2.206 0-3.228m-5.545 2.083a9.093 9.093 0 010-3.228m5.545 2.083c.57-1.023.57-2.206 0-3.228m0 0l-2.182-3.822a5.25 5.25 0 00-9.132 0L3 8.544a9.093 9.093 0 010 3.228m0 0l2.182 3.822a5.25 5.25 0 009.132 0L12 11.772z',
      titleKey: 'about.pillars.connect.title',
      descriptionKey: 'about.pillars.connect.description',
    },
    {
      iconPath: 'M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-3.75-3.75M21 12l-3.75-3.75',
      titleKey: 'about.pillars.grow.title',
      descriptionKey: 'about.pillars.grow.description',
    }
  ]);
}
