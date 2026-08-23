import { OfferStatus, canAcceptOffer, canRejectOffer, canRespondToOffer, isTerminalOfferStatus } from './offer.model';

describe('Offer model permissions', () => {
  it('keeps accepted and rejected versions terminal', () => {
    expect(isTerminalOfferStatus(OfferStatus.Accepted)).toBeTrue();
    expect(isTerminalOfferStatus(OfferStatus.Rejected)).toBeTrue();
    expect(canAcceptOffer({ status: OfferStatus.Accepted, canAccept: true })).toBeFalse();
    expect(canRespondToOffer({ status: OfferStatus.Rejected, canRespond: true })).toBeFalse();
  });

  it('uses backend authorization flags for pending actions', () => {
    expect(canAcceptOffer({ status: OfferStatus.Pending, canAccept: true })).toBeTrue();
    expect(canRejectOffer({ status: OfferStatus.Pending, canReject: false })).toBeFalse();
    expect(canRespondToOffer({ status: OfferStatus.Pending, canRespond: true })).toBeTrue();
  });
});
