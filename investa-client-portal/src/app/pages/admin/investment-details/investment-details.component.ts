import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { InvestmentService } from '../../../services/investment.service';
import { TranslatePipe } from '../../../pipes/translate.pipe';
import { Investment, InvestmentType, RiskLevel } from '../../../models/investment.model';
import { NotificationService } from '../../../services/notification.service';
import { LanguageService } from '../../../services/language.service';
import { get } from 'lodash-es';

@Component({  standalone: true,  selector: 'app-investment-preview',
  templateUrl: './investment-details.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, TranslatePipe]
})
export class InvestmentPreviewComponent {
  private route: ActivatedRoute = inject(ActivatedRoute);
  private investmentService = inject(InvestmentService);
  private notificationService = inject(NotificationService);
  private languageService = inject(LanguageService);
  
  protected readonly InvestmentType = InvestmentType;
  protected readonly RiskLevel = RiskLevel;

  investment = signal<Investment | undefined>(undefined);
  investmentToEngage = signal<Investment | null>(null);
  engagementCreditCost = 5;

  constructor() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        const numericId = parseInt(id, 10);
        // Using a computed signal from the service to find the investment
        const investmentSignal = this.investmentService.getInvestmentById(numericId);
        this.investment.set(investmentSignal());
      }
    });
  }
  
  promptEngage(investment: Investment) {
    this.investmentToEngage.set(investment);
  }

  cancelEngage() {
    this.investmentToEngage.set(null);
  }

  confirmEngage() {
    const investment = this.investmentToEngage();
    if (investment) {
      console.log(`Engaging with ${investment.name} for ${this.engagementCreditCost} credits.`);
      
      const dictionary = this.languageService.dictionary();
      const titleTemplate = get(dictionary, 'investments.engageSuccessTitle', 'Request Sent');
      const messageTemplate = get(dictionary, 'investments.engageSuccessMessage', 'Your request has been sent.');
      const message = messageTemplate.replace('{investmentName}', investment.name);

      this.notificationService.showToast({
        title: titleTemplate,
        message: message,
        type: 'success'
      });
      
      this.investmentToEngage.set(null);
    }
  }
}