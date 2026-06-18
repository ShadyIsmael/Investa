import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  recordView(investmentId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/investments/analytics/${investmentId}/view`, {});
  }

  recordLearnMore(investmentId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/investments/analytics/${investmentId}/learn-more`, {});
  }

  getFounderSummary(startDate?: string, endDate?: string): Observable<any> {
    let params = {};
    if (startDate) params['startDate'] = startDate;
    if (endDate) params['endDate'] = endDate;
    return this.http.get(`${this.apiUrl}/investments/analytics/summary`, { params });
  }

  getInvestmentMetrics(investmentId: number, startDate?: string, endDate?: string): Observable<any> {
    let params = {};
    if (startDate) params['startDate'] = startDate;
    if (endDate) params['endDate'] = endDate;
    return this.http.get(`${this.apiUrl}/investments/analytics/${investmentId}`, { params });
  }

  getOpportunitiesPerformance(startDate?: string, endDate?: string): Observable<any> {
    let params = {};
    if (startDate) params['startDate'] = startDate;
    if (endDate) params['endDate'] = endDate;
    return this.http.get(`${this.apiUrl}/investments/analytics/opportunities`, { params });
  }

  getTopPerformingOpportunities(limit: number = 5, startDate?: string, endDate?: string): Observable<any> {
    let params = { limit };
    if (startDate) params['startDate'] = startDate;
    if (endDate) params['endDate'] = endDate;
    return this.http.get(`${this.apiUrl}/investments/analytics/top-performing`, { params });
  }

  getLowPerformingOpportunities(limit: number = 5, startDate?: string, endDate?: string): Observable<any> {
    let params = { limit };
    if (startDate) params['startDate'] = startDate;
    if (endDate) params['endDate'] = endDate;
    return this.http.get(`${this.apiUrl}/investments/analytics/low-performing`, { params });
  }

  getConversionFunnel(startDate?: string, endDate?: string): Observable<any> {
    let params = {};
    if (startDate) params['startDate'] = startDate;
    if (endDate) params['endDate'] = endDate;
    return this.http.get(`${this.apiUrl}/investments/analytics/conversion-funnel`, { params });
  }
}
