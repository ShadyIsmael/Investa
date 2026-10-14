import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ProjectStageService } from './project-stage.service';
import { API_BASE } from '../config/api.token';

describe('ProjectStageService', () => {
  let service: ProjectStageService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [ProjectStageService, provideHttpClient(), provideHttpClientTesting(), { provide: API_BASE, useValue: 'https://api.test' }] });
    service = TestBed.inject(ProjectStageService);
    http = TestBed.inject(HttpTestingController);
  });

  it('loads canonical bilingual metadata and identifies Other', async () => {
    const promise = service.ensureLoaded();
    const request = http.expectOne('https://api.test/api/v1/project-stages');
    request.flush({ data: [{ code: 'Other', value: 6, nameEn: 'Other', nameAr: 'أخرى', sortOrder: 60, isActive: true, allowsCustomName: true }] });
    await promise;
    expect(service.label(6, 'ar')).toBe('أخرى');
    expect(service.find('Other')?.allowsCustomName).toBeTrue();
  });
});
