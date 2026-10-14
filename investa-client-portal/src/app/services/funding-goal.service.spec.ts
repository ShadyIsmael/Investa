import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { API_BASE } from '../config/api.token';
import { FundingGoalService } from './funding-goal.service';

describe('FundingGoalService', () => {
  let service: FundingGoalService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [FundingGoalService, { provide: API_BASE, useValue: 'https://api.test' }]
    });
    service = TestBed.inject(FundingGoalService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads the canonical API including inactive historical goals', async () => {
    const loaded = service.ensureLoaded();
    const request = http.expectOne('https://api.test/api/v1/funding-goals?includeInactive=true');
    expect(request.request.method).toBe('GET');
    request.flush({ success: true, data: [
      { id: 1, code: 'LAUNCH', nameEn: 'Launch', nameAr: 'إطلاق', sortOrder: 1, isActive: true },
      { id: 2, code: 'LEGACY', nameEn: 'Legacy', nameAr: 'قديم', sortOrder: 2, isActive: false }
    ] });
    await loaded;
    expect(service.all().length).toBe(2);
    expect(service.active().map(item => item.id)).toEqual([1]);
    expect(service.label(service.all()[1], 'ar')).toBe('قديم');
  });

  it('does not issue a second request after the master is loaded', async () => {
    const first = service.ensureLoaded();
    http.expectOne('https://api.test/api/v1/funding-goals?includeInactive=true').flush({ data: [] });
    await first;
    await service.ensureLoaded();
    http.expectNone('https://api.test/api/v1/funding-goals?includeInactive=true');
  });
});
