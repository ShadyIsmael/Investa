import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OpportunityParticipationForm, OpportunityService } from '../../services/opportunity.service';
import { NotificationService } from '../../services/notification.service';
import { PaidActionQuote, WalletService } from '../../services/wallet.service';
import { LanguageService } from '../../services/language.service';
import { Router } from '@angular/router';

export type ParticipationBuilderSource = 'PublicOpportunity' | 'Conversation';

@Component({
  selector: 'app-participation-builder',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './participation-builder.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ParticipationBuilderComponent implements OnChanges {
  private opportunityService = inject(OpportunityService);
  private notifications = inject(NotificationService);
  private walletService = inject(WalletService);
  private languageService = inject(LanguageService);
  private router = inject(Router);

  @Input({ required: true }) opportunityId!: string | number;
  @Input() opportunityTitle = '';
  @Input() source: ParticipationBuilderSource = 'PublicOpportunity';
  @Input() conversationId?: string | number | null;

  @Output() closed = new EventEmitter<void>();
  @Output() submitted = new EventEmitter<void>();

  form = signal<OpportunityParticipationForm | null>(null);
  loading = signal(false);
  submitting = signal(false);
  error = signal<string | null>(null);
  selectedShares = signal(1);
  contributionAmount = signal<number | null>(null);

  estimatedTotal = signal(0);
  expectedReturn = signal(0);
  expectedTotalRepayment = signal(0);
  paidActionQuote = signal<PaidActionQuote | null>(null);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['opportunityId'] && this.opportunityId) {
      void this.loadForm();
    }
  }

  async loadForm(): Promise<void> {
    try {
      this.loading.set(true);
      this.error.set(null);
      const form = await this.opportunityService.getParticipationForm(this.opportunityId);
      this.paidActionQuote.set(await this.walletService.getPaidActionQuote('SubmitParticipationRequest'));
      this.form.set(form);
      this.selectedShares.set(this.initialShares(form));
      this.contributionAmount.set(this.initialContribution(form));
      this.recalculate();
    } catch (error: any) {
      this.error.set(error?.error?.message || error?.message || this.t('participationBuilder.errors.loadFailed'));
    } finally {
      this.loading.set(false);
    }
  }

  close(): void {
    if (this.submitting()) return;
    this.closed.emit();
  }

  decrease(): void {
    this.setShares(this.selectedShares() - 1);
  }

  increase(): void {
    this.setShares(this.selectedShares() + 1);
  }

  onSharesInput(value: string | number): void {
    this.setShares(Number(value));
  }

  canDecrease(): boolean {
    return this.selectedShares() > this.minShares();
  }

  canIncrease(): boolean {
    return this.selectedShares() < this.maxShares();
  }

  validationMessage(): string | null {
    if (this.isLoan()) return this.loanValidationMessage();
    if (this.isProfitSharing()) return this.profitSharingValidationMessage();
    if (!this.isEquity()) return this.t('participationBuilder.validation.unsupportedModel');
    const form = this.form();
    if (!form) return null;
    const shares = this.selectedShares();
    if (!Number.isFinite(shares) || shares <= 0) return this.t('participationBuilder.validation.sharesGreaterThanZero');
    if (shares < this.minShares()) return this.t('participationBuilder.validation.minimumShares').replace('{count}', this.formatNumber(this.minShares()));
    if (shares > this.maxShares()) return this.t('participationBuilder.validation.maximumShares').replace('{count}', this.formatNumber(this.maxShares()));
    if (form.availableShares !== null && form.availableShares !== undefined && shares > Number(form.availableShares)) {
      return this.t('participationBuilder.validation.availableShares').replace('{count}', this.formatNumber(Number(form.availableShares)));
    }
    return null;
  }

  async submit(): Promise<void> {
    const validation = this.validationMessage();
    if (validation || this.submitting()) {
      this.error.set(validation);
      return;
    }
    if (this.paidActionInsufficient()) {
      this.error.set(
        this.t('paidActions.insufficientMessage')
          .replace('{required}', String(this.paidActionCost()))
          .replace('{balance}', String(this.paidActionBalance()))
      );
      return;
    }

    try {
      this.submitting.set(true);
      this.error.set(null);
      await this.opportunityService.createJoinRequest(this.opportunityId, this.submitPayload());
      this.notifications.showToast({
        title: this.t('paidActions.success.participationTitle'),
        message: this.t('paidActions.success.participationMessage'),
        type: 'success'
      });
      this.submitted.emit();
    } catch (error: any) {
      const attemptedContribution = this.contributionAmount();
      this.error.set(this.backendErrorMessage(error));
      await this.loadForm();
      if ((this.isLoan() || this.isProfitSharing()) && attemptedContribution !== null) {
        this.contributionAmount.set(attemptedContribution);
        this.recalculate();
      }
    } finally {
      this.submitting.set(false);
    }
  }

  minShares(): number {
    const form = this.form();
    const min = Number(form?.minimumShares ?? 1);
    return Number.isFinite(min) && min > 0 ? min : 1;
  }

  maxShares(): number {
    const form = this.form();
    const available = Number(form?.availableShares ?? 0);
    const max = Number(form?.maximumShares ?? available);
    const effective = Math.min(
      Number.isFinite(available) && available > 0 ? available : Number.MAX_SAFE_INTEGER,
      Number.isFinite(max) && max > 0 ? max : Number.MAX_SAFE_INTEGER
    );
    return effective === Number.MAX_SAFE_INTEGER ? this.minShares() : Math.max(effective, this.minShares());
  }

  money(value: number | null | undefined): string {
    const amount = Number(value ?? 0);
    const currency = this.form()?.currency || this.t('participationBuilder.currencyFallback');
    return `${currency} ${this.formatNumber(amount)}`;
  }

  paidActionCost(): number {
    return Number(this.paidActionQuote()?.creditCost ?? 0);
  }

  paidActionBalance(): number {
    return Number(this.paidActionQuote()?.currentBalance ?? 0);
  }

  paidActionAfter(): number {
    return Number(this.paidActionQuote()?.balanceAfter ?? this.paidActionBalance() - this.paidActionCost());
  }

  paidActionInsufficient(): boolean {
    return !!this.paidActionQuote() && !this.paidActionQuote()?.hasSufficientCredit;
  }

  addCredits(): void {
    this.router.navigate(['/admin/credit-charge']);
  }

  t(path: string): string {
    return this.languageService.translate(path);
  }

  modelLabel(): string {
    if (this.isLoan()) return this.t('participationBuilder.models.loan');
    if (this.isProfitSharing()) return this.t('participationBuilder.models.profitSharing');
    if (this.isEquity()) return this.t('participationBuilder.models.equity');
    return String(this.form()?.investmentModel ?? this.t('participationBuilder.models.unsupported'));
  }

  isEquity(): boolean {
    return this.modelKey() === 'equity' || this.modelKey() === '1';
  }

  isLoan(): boolean {
    return this.modelKey() === 'loaninvestment' || this.modelKey() === 'loan' || this.modelKey() === '3';
  }

  isProfitSharing(): boolean {
    const key = this.modelKey();
    return key === 'capitalcontributionprofitsharing'
      || key === 'profitsharing'
      || key === 'profitshare'
      || key === '2';
  }

  onContributionInput(value: string | number): void {
    const amount = Number(value);
    this.contributionAmount.set(Number.isFinite(amount) ? amount : null);
    this.error.set(null);
    this.recalculate();
  }

  minContribution(): number | null {
    return this.numberOrNull(this.form()?.minimumContribution ?? this.form()?.minimumInvestmentAmount);
  }

  maxContribution(): number | null {
    return this.numberOrNull(this.form()?.maximumContribution ?? this.form()?.maximumInvestmentAmount);
  }

  remainingFunding(): number | null {
    return this.numberOrNull(this.form()?.remainingFundingAmount);
  }

  returnRateText(): string {
    const form = this.form();
    if (form?.returnRate === null || form?.returnRate === undefined) return this.t('common.unavailable');
    const suffix = form.returnRateType ? ` ${form.returnRateType}` : '';
    return `${this.formatNumber(Number(form.returnRate), 4)}%${suffix}`;
  }

  termText(): string {
    const form = this.form();
    if (!form?.termValue) return this.t('common.unavailable');
    return `${form.termValue} ${form.termUnit || ''}`.trim();
  }

  profitShareText(): string {
    const percentage = this.profitSharePercentage();
    if (percentage === null) return this.t('common.unavailable');
    return `${this.formatNumber(percentage, 4)}%`;
  }

  profitSharingTermText(): string {
    const form = this.form();
    const termValue = this.numberOrNull(form?.termValue ?? form?.expectedDurationMonths ?? form?.durationMonths);
    if (termValue === null) return this.t('common.unavailable');
    return `${termValue} ${form?.termUnit || this.t('participationBuilder.months')}`.trim();
  }

  expectedProfitAmount(): number | null {
    return this.numberOrNull(this.form()?.expectedProfitAmount);
  }

  expectedTotalPayoutAmount(): number | null {
    return this.numberOrNull(this.form()?.expectedTotalPayoutAmount);
  }

  opportunityTotalExpectedPayout(): number | null {
    return this.numberOrNull(this.form()?.opportunityTotalExpectedPayout);
  }

  contractPeriodText(): string {
    const start = this.dateText(this.form()?.contractStartDate);
    const end = this.dateText(this.form()?.contractEndDate);
    const unavailable = this.t('common.unavailable');
    if (start === unavailable && end === unavailable) return unavailable;
    if (start !== unavailable && end !== unavailable) return `${start} - ${end}`;
    return start !== unavailable
      ? this.t('participationBuilder.startsAt').replace('{date}', start)
      : this.t('participationBuilder.endsAt').replace('{date}', end);
  }

  exitTermsText(): string {
    return this.form()?.exitTerms || this.form()?.exitStrategy || this.t('common.unavailable');
  }

  maturityDateText(): string {
    const raw = this.form()?.expectedMaturityDate;
    if (!raw) return this.t('common.unavailable');
    const date = new Date(raw);
    return Number.isNaN(date.getTime()) ? String(raw) : date.toLocaleDateString(this.languageService.language() === 'ar' ? 'ar-EG' : 'en-US');
  }

  hasRequiredLoanTerms(): boolean {
    const form = this.form();
    return this.numberOrNull(form?.returnRate) !== null && this.numberOrNull(form?.termValue) !== null;
  }

  hasProfitSharingTerms(): boolean {
    const unavailable = this.t('common.unavailable');
    return this.profitSharePercentage() !== null || this.profitSharingTermText() !== unavailable || this.exitTermsText() !== unavailable;
  }

  private setShares(value: number): void {
    const rounded = Math.floor(Number(value));
    const next = Number.isFinite(rounded) ? Math.min(Math.max(rounded, this.minShares()), this.maxShares()) : this.minShares();
    this.selectedShares.set(next);
    this.error.set(null);
    this.recalculate();
  }

  private initialShares(form: OpportunityParticipationForm): number {
    const min = Number(form.minimumShares ?? 1);
    const available = Number(form.availableShares ?? min);
    return Math.max(1, Math.min(Number.isFinite(min) ? min : 1, Number.isFinite(available) ? available : min));
  }

  private recalculate(): void {
    if (this.isLoan() || this.isProfitSharing()) {
      const contribution = Number(this.contributionAmount() ?? 0);
      if (this.isProfitSharing()) {
        this.estimatedTotal.set(contribution);
        this.expectedReturn.set(this.expectedProfitAmount() ?? 0);
        this.expectedTotalRepayment.set(this.expectedTotalPayoutAmount() ?? contribution);
        return;
      }
      const rate = Number(this.form()?.returnRate ?? 0);
      const term = Number(this.form()?.termValue ?? 0);
      const expected = contribution > 0 && rate > 0 && term > 0 ? contribution * (rate / 100) * (term / 12) : 0;
      this.expectedReturn.set(expected);
      this.expectedTotalRepayment.set(contribution + expected);
      this.estimatedTotal.set(contribution);
      return;
    }
    this.estimatedTotal.set(this.selectedShares() * Number(this.form()?.sharePrice ?? 0));
    this.expectedReturn.set(0);
    this.expectedTotalRepayment.set(0);
  }

  private initialContribution(form: OpportunityParticipationForm): number | null {
    return this.numberOrNull(form.minimumContribution ?? form.minimumInvestmentAmount);
  }

  private loanValidationMessage(): string | null {
    if (!this.hasRequiredLoanTerms()) return this.t('participationBuilder.validation.incompleteLoanTerms');
    return this.contributionValidationMessage();
  }

  private profitSharingValidationMessage(): string | null {
    return this.contributionValidationMessage();
  }

  private contributionValidationMessage(): string | null {
    const amount = Number(this.contributionAmount());
    if (!Number.isFinite(amount) || amount <= 0) return this.t('participationBuilder.validation.contributionGreaterThanZero');
    const min = this.minContribution();
    if (min !== null && amount < min) return this.t('participationBuilder.validation.minimumContribution').replace('{amount}', this.money(min));
    const max = this.maxContribution();
    if (max !== null && amount > max) return this.t('participationBuilder.validation.maximumContribution').replace('{amount}', this.money(max));
    const remaining = this.remainingFunding();
    if (remaining !== null && amount > remaining) return this.t('participationBuilder.validation.remainingFunding').replace('{amount}', this.money(remaining));
    return null;
  }

  private submitPayload(): { requestType: number; numberOfShares?: number; requestedAmount?: number; proposedSharePercentage?: number } {
    if (this.isLoan() || this.isProfitSharing()) {
      const payload: { requestType: number; requestedAmount: number; proposedSharePercentage?: number } = {
        requestType: 2,
        requestedAmount: Number(this.contributionAmount())
      };
      const profitSharePercentage = this.profitSharePercentage();
      if (this.isProfitSharing() && profitSharePercentage !== null) {
        payload.proposedSharePercentage = profitSharePercentage;
      }
      return payload;
    }
    return {
      requestType: 2,
      numberOfShares: this.selectedShares()
    };
  }

  private modelKey(): string {
    return String(this.form()?.investmentModel ?? '').toLowerCase().replace(/[\s_-]+/g, '');
  }

  private numberOrNull(value: unknown): number | null {
    if (value === null || value === undefined || value === '') return null;
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  }

  private profitSharePercentage(): number | null {
    const form = this.form();
    return this.numberOrNull(form?.profitSharePercentage ?? form?.profitSharingPercentage ?? form?.proposedSharePercentage ?? form?.returnRate);
  }

  private dateText(raw: unknown): string {
    if (!raw) return this.t('common.unavailable');
    const date = new Date(String(raw));
    return Number.isNaN(date.getTime()) ? String(raw) : date.toLocaleDateString(this.languageService.language() === 'ar' ? 'ar-EG' : 'en-US');
  }

  private backendErrorMessage(error: any): string {
    const errors = error?.error?.errors;
    if (Array.isArray(errors) && errors.length > 0) return errors.join(' ');
    return error?.error?.message || error?.message || this.t('participationBuilder.errors.submitFailed');
  }

  private formatNumber(value: number, maximumFractionDigits = 2): string {
    return new Intl.NumberFormat(this.languageService.language() === 'ar' ? 'ar-EG' : 'en-US', { maximumFractionDigits }).format(value);
  }
}
