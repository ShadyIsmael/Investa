import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InvestmentService } from '../../../services/investment.service';
import { TranslatePipe } from '../../../pipes/translate.pipe';
import { Investment, RiskLevel, InvestmentType, getInvestmentTypeDisplay, getInvestmentTypeBadgeClass } from '../../../models/investment.model';
import { NotificationService } from '../../../services/notification.service';
import { LanguageService } from '../../../services/language.service';
import { get } from 'lodash-es';

/**
 * Investment Preview Component
 * 
 * Shows a preview view of a single investment with engagement options
 */
@Component({
  standalone: true,
  selector: 'app-investment-preview',
  templateUrl: './investment-preview.component.html',  styleUrls: ['./investment-preview.component.scss'],  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, RouterLink, TranslatePipe]
})
export class InvestmentPreviewComponent {
  private route: ActivatedRoute = inject(ActivatedRoute);
  private router: Router = inject(Router);
  private investmentService = inject(InvestmentService);
  private notificationService = inject(NotificationService);
  private languageService = inject(LanguageService);
  
  protected readonly RiskLevel = RiskLevel;
  protected readonly InvestmentType = InvestmentType;

  /**
   * Navigate to a team member's profile if an id is available
   */
  navigateToMemberProfile(memberId?: string | undefined): void {
    if (!memberId) {
      const msg = this.languageService.dictionary().investmentPreview?.noTeamMembers || 'Profile unavailable';
      this.notificationService.showToast({ title: 'Profile unavailable', message: msg, type: 'info' });
      return;
    }

    try {
      this.router.navigate(['/admin/clients', memberId]);
    } catch (err) {
      console.error('Navigation error:', err);
      this.notificationService.showToast({ title: 'Navigation error', message: 'Unable to open member profile', type: 'error' });
    }
  }

  investment = signal<Investment | null>(null);
  investmentToEngage = signal<Investment | null>(null);
  investmentToInvest = signal<Investment | null>(null);
  loading = signal<boolean>(false);
  engagementCreditCost = 5;
  sharesToPurchaseValue = 1;
  sharesToPurchase = signal(1);
  investmentError = signal<string | null>(null);
  investmentProcessing = signal(false);

  constructor() {
    this.loadInvestment();
  }

  /**
   * Load investment from API
   */
  private async loadInvestment(): Promise<void> {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? parseInt(idParam, 10) : NaN;

    if (!id || isNaN(id)) {
      this.investment.set(null);
      return;
    }

    this.loading.set(true);
    try {
      const inv = await this.investmentService.getInvestmentById(id);
      this.investment.set(inv);
    } catch (error) {
      console.error('Error loading investment:', error);
      this.investment.set(null);
    } finally {
      this.loading.set(false);
    }
  }
  
  promptEngage(investment: Investment): void {
    this.investmentToEngage.set(investment);
  }

  /**
   * Open invest dialog for equity, or engagement for funding
   */
  promptInvest(investment: Investment): void {
    if (investment.investmentType === InvestmentType.Equity) {
      this.sharesToPurchaseValue = 1;
      this.investmentToInvest.set(investment);
    } else {
      this.promptEngage(investment);
    }
  }

  closeInvestDialog(): void {
    this.investmentToInvest.set(null);
    this.investmentError.set(null);
    this.investmentProcessing.set(false);
    this.sharesToPurchaseValue = 1;
  }

  increaseShares(investment: Investment): void {
    if (this.sharesToPurchaseValue < (investment.availableShares || 0)) {
      this.sharesToPurchaseValue++;
    }
  }

  decreaseShares(): void {
    if (this.sharesToPurchaseValue > 1) {
      this.sharesToPurchaseValue--;
    }
  }

  validateShares(investment: Investment): void {
    const val = this.sharesToPurchaseValue;
    const dictionary = this.languageService.dictionary();
    const minError = get(dictionary, 'investments.shareValidation.minError', 'Shares must be at least 1');
    const maxErrorTemplate = get(dictionary, 'investments.shareValidation.maxError', 'Maximum {available} shares available');

    if (isNaN(val) || val < 1) {
      this.sharesToPurchaseValue = 1;
      this.investmentError.set(minError);
    } else if (val > (investment.availableShares || 0)) {
      this.sharesToPurchaseValue = investment.availableShares || 1;
      const available = investment.availableShares || 0;
      this.investmentError.set(maxErrorTemplate.replace('{available}', String(available)));
    } else {
      this.investmentError.set(null);
    }
  }

  calculateInvestmentAmount(investment: Investment): number {
    return (investment.sharePrice || 0) * this.sharesToPurchaseValue;
  }

  confirmInvestment(investment: Investment): void {
    this.investmentProcessing.set(true);
    // Simulate API call
    setTimeout(() => {
      const { title, message } = this.getRequestSubmittedCopy(investment);

      this.notificationService.showToast({
        title,
        message,
        type: 'success'
      });
      
      this.closeInvestDialog();
      this.investmentProcessing.set(false);
    }, 1000);
  }

  cancelEngage(): void {
    this.investmentToEngage.set(null);
  }

  confirmEngage(): void {
    const investment = this.investmentToEngage();
    if (investment) {
      const { title, message } = this.getRequestSubmittedCopy(investment);

      this.notificationService.showToast({
        title,
        message,
        type: 'success'
      });
      
      this.investmentToEngage.set(null);
    }
  }

  private getRequestSubmittedCopy(investment: Investment): { title: string; message: string } {
    const dictionary = this.languageService.dictionary();
    const title = get(dictionary, 'investments.requestSubmittedTitle', 'Request Sent');
    const messageTemplate = get(
      dictionary,
      'investments.requestSubmittedMessage',
      'Your request for {investmentName} was submitted. We will notify you once it is accepted.'
    );

    return {
      title,
      message: messageTemplate.replace('{investmentName}', investment.name)
    };
  }

  // Helpers for template
  getInvestmentTypeDisplay(type: InvestmentType | number | undefined): string {
    return getInvestmentTypeDisplay(type);
  }

  getInvestmentTypeBadgeClass(type: InvestmentType | number | undefined): string {
    return getInvestmentTypeBadgeClass(type);
  }

  /**
   * Get project stages for the roadmap
   */
  getProjectStages(): string[] {
    return [
      'MVP Development',
      'Beta Testing',
      'Market Launch',
      'User Acquisition',
      'Revenue Generation',
      'Scale Operations'
    ];
  }

  /**
   * Get the current stage index based on projectPhaseId
   * Maps projectPhaseId (6-11) to stage index (0-5)
   */
  getCurrentStageIndex(): number {
    const inv = this.investment();
    if (!inv || inv.projectPhaseId === undefined || inv.projectPhaseId === null) {
      return 0;
    }

    // projectPhaseId ranges from 6 to 11 (6 phases total)
    // Map to index 0-5
    const index = inv.projectPhaseId - 6;
    return Math.max(0, Math.min(5, index));
  }
}
