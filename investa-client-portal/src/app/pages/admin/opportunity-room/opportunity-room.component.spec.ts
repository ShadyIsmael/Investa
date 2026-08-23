import { normalizeOpportunityRoomParticipations } from './opportunity-room.component';

describe('normalizeOpportunityRoomParticipations', () => {
  it('omits malformed rows and supplies safe leg collections for rendering', () => {
    const normalized = normalizeOpportunityRoomParticipations([
      undefined,
      { participationId: 0 } as any,
      {
        participationId: 1076,
        legs: [
          {
            legNumber: undefined,
            legType: 'Equity',
            amount: 1000,
            cashFlows: null,
            obligations: null
          }
        ]
      } as any
    ]);

    expect(normalized.length).toBe(1);
    expect(normalized[0].participationId).toBe(1076);
    expect(normalized[0].legs[0].legNumber).toBe(1);
    expect(normalized[0].legs[0].cashFlows).toEqual([]);
    expect(normalized[0].legs[0].obligations).toEqual([]);
  });
});
