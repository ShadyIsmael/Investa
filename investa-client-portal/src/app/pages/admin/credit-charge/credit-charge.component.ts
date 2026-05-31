import { Component, ChangeDetectionStrategy, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { UserService } from '../../../services/user.service';
import { AuthService } from '../../../services/auth.service';
import { API_BASE } from '../../../config/api.token';

type BillingPeriod = 'monthly' | 'yearly' | 'one-time';

interface AdminPricePlan {
  id: number;
  name: string;
  credits: number;
  price: number;
  billingPeriod: BillingPeriod;
  isActive: boolean;
}

@Component({
  standalone: true,
  selector: 'app-credit-charge',
  templateUrl: './credit-charge.component.html',
  styleUrls: ['./credit-charge.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule]
})
export class CreditChargeComponent implements OnInit {
  private router = inject(Router);
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private http = inject(HttpClient);
  private apiBase = inject(API_BASE);

  // State
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  selectedPlanId = signal<number | null>(null);
  showSuccessDialog = signal<boolean>(false);
  plansLoading = signal<boolean>(true);
  referenceNumber = signal<string | null>(null);
  purchasedCredits = signal<number>(0);

  // Current credits from UserService
  currentCredits = this.userService.credits;

  // Admin-created plans from API
  adminPlans = signal<AdminPricePlan[]>([]);

  readonly BILLING_LABELS: Record<BillingPeriod, string> = {
    'monthly':  'Monthly',
    'yearly':   'Yearly',
    'one-time': 'One-Time',
  };

  // Computed values
  selectedPlan = computed(() => {
    const id = this.selectedPlanId();
    if (id === null) return null;
    return this.adminPlans().find(p => p.id === id) ?? null;
  });

  ngOnInit(): void {
    this.loadPlans();
  }

  private async loadPlans(): Promise<void> {
    try {
      this.plansLoading.set(true);
      const token = this.authService.getAccessToken();
      const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
      const plans = await firstValueFrom(
        this.http.get<AdminPricePlan[]>(`${this.apiBase}/api/credit-plans`, { headers })
      );
      this.adminPlans.set(plans ?? []);
    } catch (e) {
      this.errorMessage.set('Could not load credit plans. Please try again later.');
      console.error('Failed to load credit plans:', e);
    } finally {
      this.plansLoading.set(false);
    }
  }

  selectPlan(id: number): void {
    this.selectedPlanId.set(id);
  }

  async purchasePackage(): Promise<void> {
    const plan = this.selectedPlan();
    if (!plan) return;

    await this.processPurchase(plan.credits, plan.price);
  }

  private async processPurchase(credits: number, price: number): Promise<void> {
    const plan = this.selectedPlan();
    if (!plan) return;

    try {
      this.isLoading.set(true);
      this.errorMessage.set(null);

      const token = this.authService.getAccessToken();
      const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

      const result = await firstValueFrom(
        this.http.post<{
          referenceNumber: string;
          planName: string;
          creditsAdded: number;
          newBalance: number;
        }>(
          `${this.apiBase}/api/credit-plans/${plan.id}/purchase`,
          {},
          { headers }
        )
      );

      // Update credits from server-returned balance
      this.userService.setCredits(result.newBalance);
      this.referenceNumber.set(result.referenceNumber);
      this.purchasedCredits.set(result.creditsAdded);

      // Show success dialog
      this.showSuccessDialog.set(true);

      // Navigate back after 4 seconds
      setTimeout(() => {
        this.showSuccessDialog.set(false);
        this.router.navigate(['/admin/profile']);
      }, 4000);

    } catch (e) {
      this.errorMessage.set('Purchase failed. Please try again.');
      console.error('Purchase error:', e);
    } finally {
      this.isLoading.set(false);
    }
  }

  goBack(): void {
    this.router.navigate(['/admin/profile']);
  }
}
