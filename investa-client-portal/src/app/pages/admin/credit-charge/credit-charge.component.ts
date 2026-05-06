import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslatePipe } from '../../../pipes/translate.pipe';
import { LanguageService } from '../../../services/language.service';
import { UserService } from '../../../services/user.service';

interface CreditPackage {
  credits: number;
  price: number;
  discount: number;
  popular?: boolean;
}

@Component({
  standalone: true,
  selector: 'app-credit-charge',
  templateUrl: './credit-charge.component.html',
  styleUrls: ['./credit-charge.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe]
})
export class CreditChargeComponent {
  private router = inject(Router);
  private languageService = inject(LanguageService);
  private userService = inject(UserService);

  // State
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  selectedPackage = signal<number | null>(null);
  showSuccessDialog = signal<boolean>(false);

  // Current credits from UserService
  currentCredits = this.userService.credits;

  // Credit packages
  packages: CreditPackage[] = [
    { credits: 100, price: 100, discount: 0 },
    { credits: 500, price: 450, discount: 10, popular: true },
    { credits: 1000, price: 800, discount: 20 },
    { credits: 5000, price: 3500, discount: 30 }
  ];

  // Custom amount form
  customAmountForm = new FormGroup({
    amount: new FormControl<number | null>(null, [
      Validators.required,
      Validators.min(100),
      Validators.max(100000)
    ])
  });

  // Computed values
  selectedPackageData = computed(() => {
    const selected = this.selectedPackage();
    if (selected === null) return null;
    return this.packages.find(p => p.credits === selected) || null;
  });

  customAmount = computed(() => {
    return this.customAmountForm.get('amount')?.value || 0;
  });

  // Calculate price based on tiers
  calculateCustomPrice(credits: number): number {
    if (credits < 100) return credits;
    if (credits >= 5000) return credits * 0.7; // 30% discount
    if (credits >= 1000) return credits * 0.8; // 20% discount
    if (credits >= 500) return credits * 0.9; // 10% discount
    return credits; // No discount
  }

  customPrice = computed(() => {
    const amount = this.customAmount();
    return this.calculateCustomPrice(amount);
  });

  customDiscount = computed(() => {
    const amount = this.customAmount();
    if (amount >= 5000) return 30;
    if (amount >= 1000) return 20;
    if (amount >= 500) return 10;
    return 0;
  });

  selectPackage(credits: number): void {
    this.selectedPackage.set(credits);
    this.customAmountForm.reset();
  }

  async purchasePackage(): Promise<void> {
    const pkg = this.selectedPackageData();
    if (!pkg) return;

    await this.processPurchase(pkg.credits, pkg.price);
  }

  async purchaseCustomAmount(): Promise<void> {
    if (this.customAmountForm.invalid) {
      this.errorMessage.set('Please enter a valid amount (100 - 100,000)');
      return;
    }

    const credits = this.customAmount();
    const price = this.customPrice();

    await this.processPurchase(credits, price);
  }

  private async processPurchase(credits: number, price: number): Promise<void> {
    try {
      this.isLoading.set(true);
      this.errorMessage.set(null);

      // TODO: Integrate with payment gateway (Stripe/PayPal)
      // For now, simulate API call
      await this.simulatePayment(credits, price);

      // Update credits in UserService
      const currentCredits = this.userService.credits();
      this.userService.setCredits(currentCredits + credits);

      // Show success dialog
      this.showSuccessDialog.set(true);

      // Navigate back after 2 seconds
      setTimeout(() => {
        this.showSuccessDialog.set(false);
        this.router.navigate(['/admin/profile']);
      }, 2000);

    } catch (e) {
      this.errorMessage.set('Payment failed. Please try again.');
      console.error('Payment error:', e);
    } finally {
      this.isLoading.set(false);
    }
  }

  private async simulatePayment(credits: number, price: number): Promise<void> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  goBack(): void {
    this.router.navigate(['/admin/profile']);
  }

  private t(path: string): string {
    return this.languageService.translate(path);
  }
}
