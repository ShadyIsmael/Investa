import {
  normalizeOfferStatus,
  offerConversationId,
  offerRealtimeAction
} from './conversation-offer-realtime.util';

describe('offerConversationId', () => {
  it('returns the conversation id for an offer realtime event', () => {
    expect(offerConversationId({
      type: 'ConversationOffersChanged',
      entityId: 'fallback-id',
      data: { conversationId: 'conversation-id', offerId: 22 }
    })).toBe('conversation-id');
  });

  it('falls back to the event entity id', () => {
    expect(offerConversationId({
      type: 'ConversationOffersChanged',
      entityId: 'conversation-id',
      data: {}
    })).toBe('conversation-id');
  });

  it('ignores unrelated realtime events', () => {
    expect(offerConversationId({
      type: 'ConversationMessageSaved',
      entityId: 'conversation-id',
      data: { conversationId: 'conversation-id' }
    })).toBeNull();
  });
});

describe('offerRealtimeAction', () => {
  it('normalizes an accepted offer action', () => {
    expect(offerRealtimeAction({
      type: 'ConversationOffersChanged',
      data: { conversationId: 'conversation-id', action: 'Accepted' }
    })).toBe('accepted');
  });
});

describe('normalizeOfferStatus', () => {
  it('maps backend string enum values without treating completed offers as pending', () => {
    expect(normalizeOfferStatus('Pending')).toBe(1);
    expect(normalizeOfferStatus('Replaced')).toBe(2);
    expect(normalizeOfferStatus('Accepted')).toBe(3);
    expect(normalizeOfferStatus('Rejected')).toBe(4);
    expect(normalizeOfferStatus('Withdrawn')).toBe(5);
  });

  it('continues to support numeric enum values', () => {
    expect(normalizeOfferStatus(2)).toBe(2);
    expect(normalizeOfferStatus('4')).toBe(4);
  });
});
