import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { CommonModule } from '@angular/common';

interface PricingTier {
  nameKey: string;
  price: string;
  priceSuffixKey: string;
  descriptionKey: string;
  features: string[];
  isPopular: boolean;
  buttonKey: string;
}

@Component({
  selector: 'app-pricing',
  templateUrl: './pricing.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, CommonModule]
})
export class PricingComponent {
  tiers = signal<PricingTier[]>([
    {
      nameKey: 'pricing.starter.name',
      price: '$29',
      priceSuffixKey: 'pricing.monthly',
      descriptionKey: 'pricing.starter.description',
      features: [
        'pricing.starter.features.0',
        'pricing.starter.features.1',
        'pricing.starter.features.2',
        'pricing.starter.features.3',
      ],
      isPopular: false,
      buttonKey: 'pricing.starter.button'
    },
    {
      nameKey: 'pricing.pro.name',
      price: '$99',
      priceSuffixKey: 'pricing.monthly',
      descriptionKey: 'pricing.pro.description',
      features: [
        'pricing.pro.features.0',
        'pricing.pro.features.1',
        'pricing.pro.features.2',
        'pricing.pro.features.3',
      ],
      isPopular: true,
      buttonKey: 'pricing.pro.button'
    },
    {
      nameKey: 'pricing.enterprise.name',
      price: 'Custom',
      priceSuffixKey: '',
      descriptionKey: 'pricing.enterprise.description',
      features: [
        'pricing.enterprise.features.0',
        'pricing.enterprise.features.1',
        'pricing.enterprise.features.2',
        'pricing.enterprise.features.3',
      ],
      isPopular: false,
      buttonKey: 'pricing.enterprise.button'
    }
  ]);
}
