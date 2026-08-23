import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { CurrencyService } from '../../services/currency.service';
import { LanguageService } from '../../services/language.service';
import { OfferService } from '../../services/offer.service';
import { CreateOfferPayload, OfferLeg, OfferLegType, OfferVersion } from '../../models/offer.model';

interface DraftLeg {
  enabled: boolean;
  amount: number | null;
  equityPercentage: number | null;
  sharesTerms: string;
  returnRate: number | null;
  termMonths: number | null;
  repaymentModel: string;
  profitSharePercentage: number | null;
  exitTerms: string;
}

@Component({
  standalone: true,
  selector: 'app-offer-builder',
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './offer-builder.component.html',
  styleUrls: ['./offer-builder.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OfferBuilderComponent {
  private readonly offers = inject(OfferService);
  private readonly language = inject(LanguageService);
  private readonly currency = inject(CurrencyService);

  @Input({ required: true }) opportunityId!: string | number;
  @Input() opportunityTitle = '';
  @Input() conversationId?: string | null;
  @Input() replacementOffer?: OfferVersion | null;
  @Input() mode: 'direct' | 'conversation' = 'direct';
  @Input() initialCurrency = '';
  @Output() closed = new EventEmitter<void>();
  @Output() submitted = new EventEmitter<OfferVersion>();

  submitting = signal(false);
  error = signal<string | null>(null);
  note = '';
  currencyCode = '';
  readonly types: OfferLegType[] = [OfferLegType.Equity, OfferLegType.Loan, OfferLegType.ProfitSharing];
  readonly drafts: Record<OfferLegType, DraftLeg> = {
    [OfferLegType.Equity]: this.emptyDraft(true),
    [OfferLegType.Loan]: this.emptyDraft(false),
    [OfferLegType.ProfitSharing]: this.emptyDraft(false)
  };

  ngOnInit(): void {
    this.currencyCode = this.initialCurrency || this.replacementOffer?.currency || this.currency.defaultIsoCode();
    if (this.replacementOffer) this.seed(this.replacementOffer);
  }

  close(): void {
    if (!this.submitting()) this.closed.emit();
  }

  legLabel(type: OfferLegType): string {
    const key = type === OfferLegType.Equity ? 'equity' : type === OfferLegType.Loan ? 'loan' : 'profitSharing';
    return this.language.translate(`conversationWorkspace.offerTypes.${key}`);
  }

  fieldLabel(type: OfferLegType): string {
    return type === OfferLegType.Equity
      ? this.language.translate('chat.offerBuilder.equityPercentage')
      : type === OfferLegType.Loan
        ? this.language.translate('chat.offerBuilder.returnPercentage')
        : this.language.translate('conversationWorkspace.offers.profitPercentage');
  }

  validation(): string | null {
    const active = this.types.filter(type => this.drafts[type].enabled);
    if (!active.length) return this.t('offerBuilder.validation.oneLeg');
    for (const type of active) {
      const draft = this.drafts[type];
      if (!draft.amount || draft.amount <= 0) return this.t('offerBuilder.validation.amount');
      if (type === OfferLegType.Equity && !this.validPercent(draft.equityPercentage) && !draft.sharesTerms.trim()) return this.t('offerBuilder.validation.equity');
      if (type === OfferLegType.Loan && (!this.validPercent(draft.returnRate) || !draft.termMonths || draft.termMonths <= 0 || !draft.repaymentModel.trim())) return this.t('offerBuilder.validation.loan');
      if (type === OfferLegType.ProfitSharing && (!this.validPercent(draft.profitSharePercentage) || !draft.termMonths || draft.termMonths <= 0 || !draft.exitTerms.trim())) return this.t('offerBuilder.validation.profitSharing');
    }
    return null;
  }

  async submit(): Promise<void> {
    const validation = this.validation();
    if (validation || this.submitting()) {
      this.error.set(validation);
      return;
    }
    if (this.mode === 'conversation' && !this.conversationId) {
      this.error.set(this.t('offerBuilder.errors.conversationRequired'));
      return;
    }
    try {
      this.submitting.set(true);
      this.error.set(null);
      const payload = this.payload();
      const offer = this.mode === 'conversation'
        ? await this.offers.submitConversationOffer(this.conversationId!, payload, this.replacementOffer?.id)
        : await this.offers.submitDirectOffer(this.opportunityId, payload);
      this.submitted.emit(offer);
    } catch (error: any) {
      this.error.set(error?.error?.message || error?.message || this.t('offerBuilder.errors.submit'));
    } finally {
      this.submitting.set(false);
    }
  }

  private payload(): CreateOfferPayload {
    return {
      currency: this.currencyCode.trim() || this.currency.defaultIsoCode(),
      note: this.note.trim() || null,
      legs: this.types.filter(type => this.drafts[type].enabled).map(type => this.toLeg(type))
    };
  }

  private toLeg(type: OfferLegType): OfferLeg {
    const draft = this.drafts[type];
    return {
      legType: type,
      amount: Number(draft.amount),
      equityPercentage: type === OfferLegType.Equity ? draft.equityPercentage : null,
      sharesTerms: type === OfferLegType.Equity ? draft.sharesTerms.trim() || null : null,
      returnRate: type === OfferLegType.Loan ? draft.returnRate : null,
      termMonths: type !== OfferLegType.Equity ? draft.termMonths : null,
      repaymentModel: type === OfferLegType.Loan ? draft.repaymentModel.trim() || null : null,
      profitSharePercentage: type === OfferLegType.ProfitSharing ? draft.profitSharePercentage : null,
      exitTerms: type === OfferLegType.ProfitSharing ? draft.exitTerms.trim() || null : null
    };
  }

  private seed(offer: OfferVersion): void {
    this.note = offer.note || '';
    for (const leg of offer.legs) {
      const draft = this.drafts[leg.legType];
      if (!draft) continue;
      draft.enabled = true;
      draft.amount = leg.amount;
      draft.equityPercentage = leg.equityPercentage ?? null;
      draft.sharesTerms = leg.sharesTerms || '';
      draft.returnRate = leg.returnRate ?? null;
      draft.termMonths = leg.termMonths ?? null;
      draft.repaymentModel = leg.repaymentModel || 'Monthly';
      draft.profitSharePercentage = leg.profitSharePercentage ?? null;
      draft.exitTerms = leg.exitTerms || '';
    }
  }

  private emptyDraft(enabled: boolean): DraftLeg {
    return { enabled, amount: null, equityPercentage: null, sharesTerms: '', returnRate: null, termMonths: null, repaymentModel: 'Monthly', profitSharePercentage: null, exitTerms: '' };
  }

  private validPercent(value: number | null): boolean {
    return value !== null && Number.isFinite(value) && value > 0 && value <= 100;
  }

  private t(path: string): string { return this.language.translate(path); }
}
