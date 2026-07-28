import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '../../../pipes/translate.pipe';
import { LanguageService } from '../../../services/language.service';
import { WalletService } from '../../../services/wallet.service';
import { CreditPackage, CreditPurchaseOrder, CreditPurchaseService, CreditPurchaseStatus } from '../../../services/credit-purchase.service';

@Component({
  standalone: true,
  selector: 'app-credit-charge',
  imports: [CommonModule, TranslatePipe],
  templateUrl: './credit-charge.component.html',
  styleUrls: ['./credit-charge.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreditChargeComponent implements OnInit {
  private purchases = inject(CreditPurchaseService);
  private wallet = inject(WalletService);
  readonly language = inject(LanguageService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  packages = signal<CreditPackage[]>([]);
  orders = signal<CreditPurchaseOrder[]>([]);
  selectedPackageId = signal<string | null>(null);
  selectedOrder = signal<CreditPurchaseOrder | null>(null);
  loading = signal(true);
  submitting = signal(false);
  error = signal<string | null>(null);
  currentBalance = this.wallet.balance;
  selectedPackage = computed(() => this.packages().find(item => item.id === this.selectedPackageId()) ?? null);

  async ngOnInit(): Promise<void> {
    await this.load();
    const orderId = this.route.snapshot.queryParamMap.get('orderId');
    if (orderId) await this.refreshOrder(orderId);
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const [packages, orders] = await Promise.all([
        this.purchases.getActivePackages(),
        this.purchases.getMyOrders(),
        this.wallet.loadBalance()
      ]);
      this.packages.set(packages);
      this.orders.set(orders.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)));
    } catch (error) {
      this.error.set(this.errorText(error));
    } finally {
      this.loading.set(false);
    }
  }

  selectPackage(id: string): void { this.selectedPackageId.set(id); }

  async createOrder(): Promise<void> {
    const selected = this.selectedPackage();
    if (!selected || this.submitting()) return;
    this.submitting.set(true);
    this.error.set(null);
    try {
      const order = await this.purchases.createOrder(selected.id);
      this.selectedOrder.set(order);
      this.orders.update(items => [order, ...items.filter(item => item.id !== order.id)]);
      if (order.redirectUrl) window.location.assign(order.redirectUrl);
    } catch (error) {
      this.error.set(this.errorText(error));
    } finally {
      this.submitting.set(false);
    }
  }

  async refreshOrder(id: string): Promise<void> {
    try {
      const order = await this.purchases.getOrder(id);
      this.selectedOrder.set(order);
      this.orders.update(items => [order, ...items.filter(item => item.id !== order.id)]);
      if (order.paymentStatus === 'Paid') await this.wallet.loadBalance();
    } catch (error) {
      this.error.set(this.errorText(error));
    }
  }

  viewReceipt(order: CreditPurchaseOrder): void { this.selectedOrder.set(order); }
  closeReceipt(): void { this.selectedOrder.set(null); }
  goBack(): void { this.router.navigate(['/admin/profile/wallet']); }
  packageName(item: CreditPackage | CreditPurchaseOrder): string {
    if ('planName' in item) return this.language.language() === 'ar' ? item.planNameAr : item.planName;
    return this.language.language() === 'ar' ? item.nameAr : item.name;
  }
  formatMoney(value: number, currency: string): string {
    return new Intl.NumberFormat(this.language.language() === 'ar' ? 'ar-EG' : 'en-EG', { style: 'currency', currency }).format(value);
  }
  formatNumber(value: number): string { return new Intl.NumberFormat(this.language.language() === 'ar' ? 'ar-EG' : 'en-US').format(value); }
  formatDate(value?: string | null): string { return value ? new Intl.DateTimeFormat(this.language.language() === 'ar' ? 'ar-EG' : 'en-GB', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : '—'; }
  statusKey(status: CreditPurchaseStatus): string { return `creditPurchase.status.${status}`; }
  statusTone(status: CreditPurchaseStatus): string {
    if (status === 'Paid') return 'status status--paid';
    if (status === 'Failed' || status === 'Cancelled' || status === 'Expired') return 'status status--failed';
    if (status === 'Refunded') return 'status status--refunded';
    return 'status status--pending';
  }
  private errorText(error: unknown): string {
    const value = error as { error?: { message?: string }; message?: string };
    return value?.error?.message || value?.message || this.language.translate('creditPurchase.error');
  }
}
