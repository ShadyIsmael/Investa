import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { API_BASE } from '../config/api.token';
import { OpportunityService } from './opportunity.service';

describe('OpportunityService Project Context contract', () => {
  let service: OpportunityService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        OpportunityService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE, useValue: 'https://api.test' }
      ]
    });
    service = TestBed.inject(OpportunityService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads the authoritative parent Project context with authenticated Opportunity details', async () => {
    const result = service.getFounderOpportunity(17);
    const request = http.expectOne('https://api.test/api/v1/opportunities/17');

    request.flush({
      success: true,
      data: {
        id: 17,
        projectId: 4,
        title: 'Funding opportunity',
        projectContext: {
          id: 4,
          displayName: 'Solar Kitchens',
          summary: 'Affordable clean cooking for urban homes.',
          description: 'A durable Project description.',
          industry: 'Clean technology',
          geography: 'Cairo',
          teamDescription: 'Operations and engineering team.',
          businessModel: 'B2B2C',
          status: 'Active',
          projectStage: 'Growth',
          defaultCurrency: 'EGP'
        }
      }
    });

    const opportunity = await result;
    expect(opportunity.projectId).toBe(4);
    expect(opportunity.projectContext?.displayName).toBe('Solar Kitchens');
    expect(opportunity.projectContext?.description).toBe('A durable Project description.');
    expect(opportunity.projectContext?.geography).toBe('Cairo');
    expect(opportunity.projectContext?.teamDescription).toContain('engineering');
    expect(opportunity.projectContext?.businessModel).toBe('B2B2C');
  });

  it('keeps Project context separate from funding Opportunity fields', async () => {
    const result = service.getPublicOpportunity(23);
    const request = http.expectOne('https://api.test/api/v1/public/opportunities/23');

    request.flush({
      data: {
        id: 23,
        projectId: 9,
        title: 'Working capital round',
        fundingTarget: 250000,
        projectContext: { id: 9, displayName: 'North Star Foods', summary: 'Food distribution network.' }
      }
    });

    const opportunity = await result;
    expect(opportunity.projectContext?.displayName).toBe('North Star Foods');
    expect(opportunity.fundingTarget).toBe(250000);
    expect((opportunity.projectContext as any)?.fundingTarget).toBeUndefined();
  });

  it('sends Use of Funds once in Create payloads', async () => {
    const result = service.createOpportunity({
      title: 'Working capital round',
      shortDescription: 'A sufficiently detailed opportunity summary.',
      useOfFunds: 'Fund the initial production and distribution rollout.'
    });
    const request = http.expectOne('https://api.test/api/v1/opportunities');

    expect(request.request.body.useOfFunds).toBe('Fund the initial production and distribution rollout.');
    request.flush({ data: { id: 24, title: 'Working capital round' } });
    await result;
  });

  it('loads parent Project context with the Opportunity Room', async () => {
    const result = service.getOpportunityRoom(24);
    const request = http.expectOne('https://api.test/api/v1/opportunities/24/room');

    request.flush({
      data: {
        projectId: 9,
        projectDisplayName: 'North Star Foods',
        projectContext: {
          id: 9,
          displayName: 'North Star Foods',
          summary: 'Food distribution network.',
          industry: 'Food and beverage',
          geography: 'Cairo',
          projectStage: 'Growth',
          logoUrl: '/projects/9/logo.png'
        },
        overview: { id: 24, title: 'Working capital round', useOfFunds: 'Fund distribution.' }
      }
    });

    const room = await result;
    expect(room.projectContext?.displayName).toBe('North Star Foods');
    expect(room.projectContext?.projectStage).toBe('Growth');
    expect(room.overview?.useOfFunds).toBe('Fund distribution.');
  });
});
