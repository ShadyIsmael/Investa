import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_BASE } from '../config/api.token';
import { ApiResponse } from '../models/api-response.model';

export type ReportTargetType = 'Opportunity' | 'User' | 'Conversation' | 'Participant';
type BackendReportTargetType = 0 | 1 | 2 | 3;

export type ReportReasonCode =
  | 'SuspiciousOpportunity'
  | 'MisleadingInformation'
  | 'Spam'
  | 'Abuse'
  | 'FraudConcern'
  | 'InappropriateContent'
  | 'Other';
type BackendReportReasonCode = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface CreateReportRequest {
  targetType: ReportTargetType;
  targetId: string | number;
  reasonCode: ReportReasonCode;
  description?: string | null;
}

interface BackendCreateReportRequest {
  targetType: BackendReportTargetType;
  targetId: string;
  reasonCode: BackendReportReasonCode;
  description?: string | null;
}

const REPORT_TARGET_TYPE_VALUE: Record<ReportTargetType, BackendReportTargetType> = {
  Opportunity: 0,
  User: 1,
  Conversation: 2,
  Participant: 3
};

const REPORT_REASON_CODE_VALUE: Record<ReportReasonCode, BackendReportReasonCode> = {
  SuspiciousOpportunity: 0,
  MisleadingInformation: 1,
  Spam: 2,
  Abuse: 3,
  FraudConcern: 4,
  InappropriateContent: 5,
  Other: 6
};

@Injectable({ providedIn: 'root' })
export class ReportService {
  constructor(
    private http: HttpClient,
    @Inject(API_BASE) private apiBase: string
  ) {}

  async createReport(payload: CreateReportRequest): Promise<void> {
    const request = this.toBackendRequest(payload);
    const raw = await firstValueFrom(
      this.http.post<ApiResponse<unknown> | unknown>(
        `${this.apiBase}/api/v1/reports`,
        request,
        { headers: this.authHeaders() }
      )
    );

    const wrapped = raw as ApiResponse<unknown>;
    if (wrapped?.success === false) {
      throw new Error(wrapped.message || 'REPORT_FAILED');
    }
  }

  private toBackendRequest(payload: CreateReportRequest): BackendCreateReportRequest {
    return {
      targetType: REPORT_TARGET_TYPE_VALUE[payload.targetType],
      targetId: String(payload.targetId),
      reasonCode: REPORT_REASON_CODE_VALUE[payload.reasonCode],
      description: payload.description ?? null
    };
  }

  private authHeaders(): HttpHeaders {
    const token = this.getAccessTokenFromLocalStorage();
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }

  private getAccessTokenFromLocalStorage(): string | null {
    try {
      return localStorage.getItem('accessToken');
    } catch {
      return null;
    }
  }
}
