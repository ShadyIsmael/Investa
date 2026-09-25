import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_BASE } from '../config/api.token';
import { ApiResponse } from '../models/api-response.model';
import { FounderDashboard } from '../models/founder-dashboard.model';

@Injectable({ providedIn: 'root' })
export class FounderDashboardService {
  constructor(private http: HttpClient, @Inject(API_BASE) private apiBase: string) {}

  async getDashboard(fromUtc?: string, toUtc?: string): Promise<FounderDashboard> {
    let params = new HttpParams();
    if (fromUtc) params = params.set('fromUtc', fromUtc);
    if (toUtc) params = params.set('toUtc', toUtc);
    const token = localStorage.getItem('accessToken');
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
    const raw = await firstValueFrom(this.http.get<ApiResponse<FounderDashboard>>(
      `${this.apiBase}/api/v1/founder/dashboard`, { headers, params }
    ));
    return raw?.data ?? raw as unknown as FounderDashboard;
  }
}
