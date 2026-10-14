import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { API_BASE } from '../config/api.token';
import { RiskLevelService } from './risk-level.service';

describe('RiskLevelService', () => {
  let service: RiskLevelService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule], providers: [RiskLevelService, { provide: API_BASE, useValue: 'https://api.test' }] });
    service = TestBed.inject(RiskLevelService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads canonical bilingual metadata including inactive historical values', async () => {
    const promise = service.ensureLoaded();
    const request = http.expectOne('https://api.test/api/v1/risk-levels?includeInactive=true');
    request.flush({ data: [
      { id: 1, code: 'LOW', nameEn: 'Low', nameAr: 'منخفض', sortOrder: 1, isActive: true },
      { id: 2, code: 'LEGACY', nameEn: 'Legacy', nameAr: 'قديم', sortOrder: 2, isActive: false }
    ] });
    await promise;
    expect(service.active().map(item => item.code)).toEqual(['LOW']);
    expect(service.label('legacy', 'ar')).toBe('قديم');
  });
});
