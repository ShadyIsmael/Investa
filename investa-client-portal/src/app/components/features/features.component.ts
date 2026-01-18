import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { TranslatePipe } from '../../pipes/translate.pipe';

interface Feature {
  iconPath: string;
  titleKey: string;
  descriptionKey: string;
}

@Component({
  selector: 'app-features',
  templateUrl: './features.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe]
})
export class FeaturesComponent {
  features = signal<Feature[]>([
    {
      iconPath: 'M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z',
      titleKey: 'features.realTime.title',
      descriptionKey: 'features.realTime.description'
    },
    {
      iconPath: 'M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75',
      titleKey: 'features.automatedTrading.title',
      descriptionKey: 'features.automatedTrading.description'
    },
    {
      iconPath: 'M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9',
      titleKey: 'features.portfolioOptimization.title',
      descriptionKey: 'features.portfolioOptimization.description'
    }
  ]);
}
