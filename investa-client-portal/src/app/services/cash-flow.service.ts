import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_BASE } from '../config/api.token';
import { AuthService } from './auth.service';

export type PaymentScheduleStatus = 'Upcoming' | 'Due' | 'Paid' | 'PartiallyPaid' | 'Overdue' | 'Cancelled';

export interface CashFlowSummary {
  currency: string;
  totalInvestedAmount: number;
  expectedIncomeThisMonth: number;
  nextPaymentAmount: number;
  nextPaymentDate: string | null;
  expectedNextTwelveMonths: number;
  totalExpectedInterest: number;
  receivedToDate: number | null;
  remainingPrincipal: number;
  overdueAmount: number | null;
}

export interface MonthlyCashFlow {
  month: string;
  expectedInterest: number;
  expectedPrincipal: number;
  actualReceived: number | null;
}

export interface PaymentScheduleItem {
  dueDate: string;
  expectedInterest: number;
  expectedPrincipal: number;
  expectedTotal: number;
  actualPaid: number | null;
  status: PaymentScheduleStatus;
}

export interface ParticipationPaymentSchedule {
  participationId: string | number;
  currency: string;
  approvedAmount: number;
  annualInterestRate: number;
  durationMonths: number;
  repaymentFrequency: 'Monthly' | 'Quarterly' | 'SemiAnnual' | 'Annual';
  principalRepayment: 'AtMaturity';
  startDate: string;
  finalRepaymentDate: string;
  totalExpectedInterest: number;
  averageExpectedMonthlyIncome: number;
  receivedToDate: number | null;
  remainingPrincipal: number;
  items: PaymentScheduleItem[];
}

@Injectable({ providedIn: 'root' })
export class CashFlowService {
  private http = inject(HttpClient);
  private apiBase = inject(API_BASE);
  private auth = inject(AuthService);

  async getSummary(): Promise<CashFlowSummary> {
    const value = this.data<any>(await firstValueFrom(this.http.get<any>(`${this.apiBase}/api/v1/opportunities/investor-cash-flow/summary`, this.auth.getAuthorizedJsonOptions())));
    return { ...value, expectedNextTwelveMonths: value.expectedNextTwelveMonths ?? value.nextTwelveMonths ?? 0 };
  }

  async getMonthly(months = 12): Promise<MonthlyCashFlow[]> {
    const raw = await firstValueFrom(this.http.get<any>(`${this.apiBase}/api/v1/opportunities/investor-cash-flow/monthly`, {
      ...this.auth.getAuthorizedJsonOptions(), params: { months }
    }));
    const value = this.data<any>(raw);
    return Array.isArray(value) ? value : value?.items ?? [];
  }

  async getUpcoming(limit = 5): Promise<PaymentScheduleItem[]> {
    const raw = await firstValueFrom(this.http.get<any>(`${this.apiBase}/api/v1/opportunities/investor-cash-flow/upcoming`, {
      ...this.auth.getAuthorizedJsonOptions(), params: { limit }
    }));
    const value = this.data<any>(raw);
    return Array.isArray(value) ? value : value?.items ?? [];
  }

  async getParticipationSchedule(participationId: string | number): Promise<ParticipationPaymentSchedule> {
    const raw = await firstValueFrom(this.http.get<any>(
      `${this.apiBase}/api/v1/opportunities/participations/${encodeURIComponent(String(participationId))}/payment-schedule`,
      this.auth.getAuthorizedJsonOptions()
    ));
    const value = this.data<any>(raw);
    return {
      ...value,
      participationId: value.participationId ?? value.participationRequestId,
      approvedAmount: value.approvedAmount ?? value.principal,
      principalRepayment: value.principalRepayment ?? value.principalRepaymentMethod,
      items: value.items ?? value.payments ?? []
    };
  }

  private data<T>(raw: any): T {
    return (raw?.data ?? raw) as T;
  }
}
