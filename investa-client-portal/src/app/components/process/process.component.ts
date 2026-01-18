import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { TranslatePipe } from '../../pipes/translate.pipe';

interface ProcessStep {
  step: string;
  titleKey: string;
  descriptionKey: string;
}

@Component({
  selector: 'app-process',
  templateUrl: './process.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe]
})
export class ProcessComponent {
  steps = signal<ProcessStep[]>([
    {
      step: '01',
      titleKey: 'process.step1.title',
      descriptionKey: 'process.step1.description'
    },
    {
      step: '02',
      titleKey: 'process.step2.title',
      descriptionKey: 'process.step2.description'
    },
    {
      step: '03',
      titleKey: 'process.step3.title',
      descriptionKey: 'process.step3.description'
    },
    {
      step: '04',
      titleKey: 'process.step4.title',
      descriptionKey: 'process.step4.description'
    }
  ]);
}
