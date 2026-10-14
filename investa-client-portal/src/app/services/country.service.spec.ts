import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CountryService } from './country.service';
import { API_BASE } from '../config/api.token';

describe('CountryService', () => {
  let service: CountryService; let http: HttpTestingController;
  beforeEach(() => { TestBed.configureTestingModule({ imports: [HttpClientTestingModule], providers: [CountryService, { provide: API_BASE, useValue: 'http://api' }] }); service = TestBed.inject(CountryService); http = TestBed.inject(HttpTestingController); });
  afterEach(() => http.verify());
  it('loads canonical bilingual countries and keeps inactive records available', async () => {
    const promise = service.ensureLoaded();
    const request = http.expectOne('http://api/api/v1/countries?includeInactive=true');
    request.flush({ data: [{ Id: 1, IsoAlpha2: 'eg', NameEn: 'Egypt', NameAr: 'مصر', IsActive: false, SortOrder: 1, PhoneCode: '+20' }] });
    await promise;
    expect(service.all()[0].isoAlpha2).toBe('EG');
    expect(service.all()[0].nameAr).toBe('مصر');
    expect(service.all()[0].isActive).toBeFalse();
    expect(service.active()).toEqual([]);
  });
});
