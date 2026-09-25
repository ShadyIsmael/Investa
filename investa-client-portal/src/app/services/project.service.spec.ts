import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { API_BASE } from '../config/api.token';
import { ProjectService } from './project.service';

describe('ProjectService', () => {
  let service: ProjectService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProjectService, provideHttpClient(), provideHttpClientTesting(), { provide: API_BASE, useValue: 'https://api.test' }]
    });
    service = TestBed.inject(ProjectService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads founder-owned projects from the versioned API', async () => {
    const result = service.list();
    http.expectOne('https://api.test/api/v1/projects').flush({ success: true, data: [{ id: 7, displayName: 'Business', opportunityCount: 2, canCreateOpportunity: true, opportunities: [{id:11, sequenceNumber:1}, {id:12, sequenceNumber:2}] }] });
    const project = (await result)[0];
    expect(project.id).toBe(7);
    expect(project.opportunities.map(item => item.sequenceNumber)).toEqual([1, 2]);
  });

  it('creates a project independently from its opportunities', async () => {
    const payload: any = { displayName: 'Business', summary: 'A sufficiently long summary', description: 'A sufficiently long description', businessStage: 2 };
    const result = service.create(payload);
    const request = http.expectOne('https://api.test/api/v1/projects');
    expect(request.request.method).toBe('POST');
    expect(request.request.body.displayName).toBe('Business');
    request.flush({ success: true, data: { id: 8, ...payload, opportunityCount: 0, canCreateOpportunity: true } });
    expect((await result).id).toBe(8);
  });
});
