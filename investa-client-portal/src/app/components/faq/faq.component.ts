import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { TranslatePipe } from '../../pipes/translate.pipe';

interface FaqItem {
  questionKey: string;
  answerKey: string;
  isOpen: boolean;
}

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe]
})
export class FaqComponent {
  faqs = signal<FaqItem[]>([
    { questionKey: 'faq.q1', answerKey: 'faq.a1', isOpen: false },
    { questionKey: 'faq.q2', answerKey: 'faq.a2', isOpen: false },
    { questionKey: 'faq.q3', answerKey: 'faq.a3', isOpen: false },
    { questionKey: 'faq.q4', answerKey: 'faq.a4', isOpen: false },
    { questionKey: 'faq.q5', answerKey: 'faq.a5', isOpen: false },
  ]);

  toggleFaq(index: number) {
    this.faqs.update(currentFaqs => {
      return currentFaqs.map((faq, i) => {
        if (i === index) {
          return { ...faq, isOpen: !faq.isOpen };
        }
        // Uncomment the line below to close other FAQs when one is opened
        // return { ...faq, isOpen: false };
        return faq;
      });
    });
  }
}
