import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { API_BASE } from '../config/api.token';
import { OfferLegType, OfferStatus } from '../models/offer.model';
import { OfferService } from './offer.service';

describe('OfferService', () => {
  let service: OfferService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [OfferService, provideHttpClient(), provideHttpClientTesting(), { provide: API_BASE, useValue: 'https://api.test' }]
    });
    service = TestBed.inject(OfferService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('submits a mixed-leg direct offer as one complete payload', async () => {
    const result = service.submitDirectOffer(17, {
      currency: 'USD',
      legs: [
        { legType: OfferLegType.Equity, amount: 10000, equityPercentage: 8 },
        { legType: OfferLegType.Loan, amount: 5000, returnRate: 10, termMonths: 24, repaymentModel: 'Monthly' },
        { legType: OfferLegType.ProfitSharing, amount: 2500, profitSharePercentage: 12, termMonths: 18, exitTerms: 'At maturity' }
      ]
    });
    const request = http.expectOne('https://api.test/api/v1/opportunities/17/offers');
    expect(request.request.method).toBe('POST');
    expect(request.request.body.legs.length).toBe(3);
    request.flush({ success: true, data: { id: 41, status: OfferStatus.Pending, legs: request.request.body.legs } });
    expect((await result).id).toBe(41);
  });

  it('creates a complete replacement version against the exact prior version', async () => {
    const result = service.submitConversationOffer('conversation-1', {
      currency: 'USD',
      legs: [{ legType: OfferLegType.Loan, amount: 9000, returnRate: 9, termMonths: 12, repaymentModel: 'Bullet' }]
    }, 12);
    const request = http.expectOne('https://api.test/api/v1/conversations/conversation-1/offers/12/replace');
    expect(request.request.method).toBe('POST');
    request.flush({ success: true, data: { id: 13, version: 2, replacesOfferId: 12, status: OfferStatus.Pending } });
    expect((await result).id).toBe(13);
  });

  it('targets exact versions for accept and reject actions', async () => {
    const accept = service.acceptConversationOffer('conversation-1', 13);
    const acceptRequest = http.expectOne('https://api.test/api/v1/conversations/conversation-1/offers/13/accept');
    acceptRequest.flush({ success: true, data: { offer: { id: 13, status: OfferStatus.Accepted } } });
    await accept;

    const reject = service.rejectConversationOffer('conversation-1', 14);
    const rejectRequest = http.expectOne('https://api.test/api/v1/conversations/conversation-1/offers/14/reject');
    rejectRequest.flush({ success: true, data: { id: 14, status: OfferStatus.Rejected } });
    expect((await reject).id).toBe(14);
  });
});
