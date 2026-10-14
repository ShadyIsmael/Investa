import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { CurrencyDisplayPipe } from '../../pipes/currency-display.pipe';
import { OfferService } from '../../services/offer.service';
import { LanguageService } from '../../services/language.service';
import { OfferLegType, OfferStatus, OfferVersion, isTerminalOfferStatus, repaymentModelLabelKey } from '../../models/offer.model';

@Component({
  standalone: true,
  selector: 'app-direct-offer-inbox',
  imports: [CommonModule, RouterLink, TranslatePipe, CurrencyDisplayPipe],
  templateUrl: './direct-offer-inbox.component.html',
  styleUrls: ['./direct-offer-inbox.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DirectOfferInboxComponent {
  private readonly service = inject(OfferService);
  private readonly language = inject(LanguageService);
  readonly offers = signal<OfferVersion[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly processingId = signal<number | null>(null);

  repaymentModelLabel(value: string | null | undefined): string {
    const key = repaymentModelLabelKey(value);
    return key ? this.t(key) : String(value ?? '');
  }

  constructor() { void this.load(); }

  async load(): Promise<void> {
    try {
      this.loading.set(true);
      this.error.set(null);
      const [incoming, outgoing] = await Promise.all([
        this.service.getDirectInbox('incoming'),
        this.service.getDirectInbox('outgoing')
      ]);
      this.offers.set([...incoming, ...outgoing].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (error: any) {
      this.error.set(error?.error?.message || error?.message || this.t('requests.directOffers.loadError'));
      this.offers.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  async accept(offer: OfferVersion): Promise<void> { await this.action(offer, 'accept'); }
  async reject(offer: OfferVersion): Promise<void> { await this.action(offer, 'reject'); }

  canAccept(offer: OfferVersion): boolean { return offer.status === OfferStatus.Pending && offer.canAccept === true && this.processingId() === null; }
  canReject(offer: OfferVersion): boolean { return offer.status === OfferStatus.Pending && offer.canReject === true && this.processingId() === null; }
  isTerminal(offer: OfferVersion): boolean { return isTerminalOfferStatus(offer.status); }

  totalAmount(offer: OfferVersion): number { return offer.legs.reduce((total, leg) => total + Number(leg.amount || 0), 0); }

  submittedAt(offer: OfferVersion): string {
    const date = new Date(offer.createdAt);
    if (Number.isNaN(date.getTime())) return this.t('requests.directOffers.unavailable');
    return new Intl.DateTimeFormat(this.language.language() === 'ar' ? 'ar-EG' : 'en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
  }

  status(offer: OfferVersion): string {
    const key = OfferStatus[offer.status]?.toLowerCase() || 'pending';
    return this.t(`requests.directOffers.status.${key}`);
  }

  legLabel(type: OfferLegType): string {
    const key = type === OfferLegType.Equity ? 'equity' : type === OfferLegType.Loan ? 'loan' : 'profitSharing';
    return this.t(`conversationWorkspace.offerTypes.${key}`);
  }

  t(path: string): string { return this.language.translate(path); }

  private async action(offer: OfferVersion, action: 'accept' | 'reject'): Promise<void> {
    if (!offer.opportunityId || (action === 'accept' ? !this.canAccept(offer) : !this.canReject(offer))) return;
    if (!window.confirm(this.t(`requests.directOffers.confirm.${action}`))) return;
    try {
      this.processingId.set(offer.id);
      const updated = action === 'accept'
        ? await this.service.acceptDirectOffer(offer.opportunityId, offer.id)
        : await this.service.rejectDirectOffer(offer.opportunityId, offer.id);
      this.offers.update(items => items.map(item => item.id === offer.id ? { ...item, ...updated } : item));
      this.error.set(null);
    } catch (error: any) {
      this.error.set(error?.error?.message || error?.message || this.t(`requests.directOffers.${action}Error`));
    } finally {
      this.processingId.set(null);
    }
  }
}
