import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { API_BASE } from '../config/api.token';
import { ProjectCategoryService } from './project-category.service';

describe('ProjectCategoryService', () => {
  let service: ProjectCategoryService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ProjectCategoryService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE, useValue: 'https://api.test' }
      ]
    });
    service = TestBed.inject(ProjectCategoryService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads the canonical bilingual master including inactive records for historical display', async () => {
    const result = service.ensureLoaded();
    const request = http.expectOne('https://api.test/api/v1/categories?includeInactive=true');
    expect(request.request.method).toBe('GET');
    request.flush({
      success: true,
      data: [
        { id: 2, code: 'FOOD', nameEn: 'Food', nameAr: 'أغذية', sortOrder: 2, isActive: false },
        { id: 1, code: 'TECH', nameEn: 'Technology', nameAr: 'تكنولوجيا', sortOrder: 1, isActive: true }
      ]
    });
    await result;

    expect(service.all().length).toBe(2);
    expect(service.active().map(item => item.code)).toEqual(['TECH']);
    expect(service.label(service.all()[0], 'ar')).toBe('أغذية');
  });

  it('does not make a second request after the master is loaded', async () => {
    const first = service.ensureLoaded();
    http.expectOne('https://api.test/api/v1/categories?includeInactive=true').flush({ data: [] });
    await first;

    await service.ensureLoaded();
    http.expectNone('https://api.test/api/v1/categories?includeInactive=true');
  });
});
