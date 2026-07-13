import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_BASE } from '../config/api.token';
import { ApiResponse } from '../models/api-response.model';

export type InvestmentContractStatus = 0 | 1 | string;
export type InvestmentContractVersionType = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | string;
export type InvestmentContractVersionStatus = 0 | 1 | 2 | 3 | string;
export type PdfGenerationStatus = 0 | 1 | 2 | 3 | string;

export interface InvestmentContractSummary {
  contractId: number;
  contractNumber: string;
  founderDisplayName: string;
  investorDisplayName: string;
  investmentModel: string | number;
  currentVersionNumber: number;
  status: InvestmentContractStatus;
  latestAgreementDate: string;
  versionCount: number;
}

export interface InvestmentContractVersionSummary {
  versionNumber: number;
  versionType: InvestmentContractVersionType;
  status: InvestmentContractVersionStatus;
  createdAt: string;
  activatedAt?: string | null;
  documentHash: string;
}

export interface InvestmentContractVersion extends InvestmentContractVersionSummary {
  termsSnapshotJson: string;
  previousTermsSnapshotJson?: string | null;
  changesSnapshotJson?: string | null;
  htmlPreviewAvailable: boolean;
  pdfStatus: PdfGenerationStatus;
  pdfDownloadAvailable: boolean;
  pdfGeneratedAt?: string | null;
  pdfHash?: string | null;
  pdfDocumentSize?: number | null;
}

export interface InvestmentContractDetail {
  contract: InvestmentContractSummary;
  currentVersion: InvestmentContractVersion;
  versionHistory: InvestmentContractVersionSummary[];
}

export interface ContractPdfDownload {
  blob: Blob;
  fileName: string;
}

@Injectable({ providedIn: 'root' })
export class ContractService {
  constructor(
    private http: HttpClient,
    @Inject(API_BASE) private apiBase: string
  ) {}

  getOpportunityContracts(opportunityId: string | number): Promise<InvestmentContractSummary[]> {
    return this.getList(`/api/v1/opportunities/${encodeURIComponent(String(opportunityId))}/contracts`);
  }

  getContract(contractId: string | number): Promise<InvestmentContractDetail> {
    return this.getOne(`/api/v1/contracts/${encodeURIComponent(String(contractId))}`);
  }

  getVersion(contractId: string | number, versionNumber: string | number): Promise<InvestmentContractVersion> {
    return this.getOne(`/api/v1/contracts/${encodeURIComponent(String(contractId))}/versions/${encodeURIComponent(String(versionNumber))}`);
  }

  getPreviewHtml(contractId: string | number, versionNumber: string | number): Promise<string> {
    return firstValueFrom(
      this.http.get(
        `${this.apiBase}/api/v1/contracts/${encodeURIComponent(String(contractId))}/versions/${encodeURIComponent(String(versionNumber))}/preview`,
        { headers: this.authHeaders(false), responseType: 'text' }
      )
    );
  }

  async downloadPdf(contractId: string | number, versionNumber: string | number): Promise<ContractPdfDownload> {
    const response = await firstValueFrom(
      this.http.get(
        `${this.apiBase}/api/v1/contracts/${encodeURIComponent(String(contractId))}/versions/${encodeURIComponent(String(versionNumber))}/pdf`,
        { headers: this.authHeaders(false), observe: 'response', responseType: 'blob' }
      )
    );
    return {
      blob: response.body ?? new Blob([], { type: 'application/pdf' }),
      fileName: this.fileNameFromResponse(response) || `contract-v${versionNumber}.pdf`
    };
  }

  private async getList<T = any>(path: string): Promise<T[]> {
    const raw = await firstValueFrom(
      this.http.get<ApiResponse<T[]> | T[]>(`${this.apiBase}${path}`, { headers: this.authHeaders() })
    );
    return this.extractData<T[]>(raw, 'Failed to load contracts.') ?? [];
  }

  private async getOne<T = any>(path: string): Promise<T> {
    const raw = await firstValueFrom(
      this.http.get<ApiResponse<T> | T>(`${this.apiBase}${path}`, { headers: this.authHeaders() })
    );
    return this.extractData<T>(raw, 'Failed to load contract.');
  }

  private extractData<T>(raw: ApiResponse<T> | T | null | undefined, fallbackMessage: string): T {
    if (!raw) throw new Error(fallbackMessage);
    const wrapped = raw as ApiResponse<T>;
    if (wrapped.data !== undefined) {
      if (wrapped.success === false) throw new Error(wrapped.message || fallbackMessage);
      return wrapped.data;
    }
    return raw as T;
  }

  private fileNameFromResponse(response: HttpResponse<Blob>): string | null {
    const disposition = response.headers.get('content-disposition');
    const match = disposition?.match(/filename\*?=(?:UTF-8''|")?([^";]+)/i);
    return match ? decodeURIComponent(match[1].replace(/"/g, '')) : null;
  }

  private authHeaders(json = true): HttpHeaders {
    const token = localStorage.getItem('accessToken');
    let headers = new HttpHeaders(token ? { Authorization: `Bearer ${token}` } : {});
    return json ? headers.set('Content-Type', 'application/json') : headers;
  }
}
