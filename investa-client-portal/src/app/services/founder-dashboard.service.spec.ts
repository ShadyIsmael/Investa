import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { API_BASE } from '../config/api.token';
import { FounderDashboardService } from './founder-dashboard.service';

describe('FounderDashboardService', () => {
  let service: FounderDashboardService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FounderDashboardService, provideHttpClient(), provideHttpClientTesting(), { provide: API_BASE, useValue: 'https://api.test' }]
    });
    service = TestBed.inject(FounderDashboardService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('uses the single founder portfolio endpoint and does not request opportunity lists', async () => {
    const result = service.getDashboard();
    const request = http.expectOne('https://api.test/api/v1/founder/dashboard');
    expect(request.request.method).toBe('GET');
    request.flush({ success: true, data: { displayCurrency: 'EGP', metrics: { totalProjects: 2 }, projects: [], timeSeries: { fundingApprovals: [], receivedAmounts: [], earnings: [] }, availability: { followers: 'deferred' } } });
    expect((await result).metrics.totalProjects).toBe(2);
  });

  it('passes backend-owned time range parameters without client aggregation', async () => {
    const result = service.getDashboard('2026-01-01T00:00:00Z', '2026-04-01T00:00:00Z');
    const request = http.expectOne(r => r.url === 'https://api.test/api/v1/founder/dashboard');
    expect(request.request.params.get('fromUtc')).toBe('2026-01-01T00:00:00Z');
    expect(request.request.params.get('toUtc')).toBe('2026-04-01T00:00:00Z');
    request.flush({ success: true, data: { displayCurrency: 'EGP', metrics: { totalProjects: 0 }, projects: [], timeSeries: { fundingApprovals: [], receivedAmounts: [], earnings: [] }, availability: { followers: 'deferred' } } });
    expect((await result).projects).toEqual([]);
  });
});
