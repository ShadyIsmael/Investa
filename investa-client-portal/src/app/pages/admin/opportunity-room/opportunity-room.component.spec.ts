import { calculateConfirmedFundingProgress, opportunityRoomProjectRoute } from './opportunity-room.component';

describe('OpportunityRoomComponent project context navigation', () => {
  it('opens Project Details for founders', () => {
    expect(opportunityRoomProjectRoute(42, true)).toEqual(['/admin/projects', 42]);
  });

  it('opens the normal Project Details view for authorized investors', () => {
    expect(opportunityRoomProjectRoute(42, false)).toEqual(['/admin/projects', 42]);
  });

  it('calculates funding progress from confirmed receipts only', () => {
    expect(calculateConfirmedFundingProgress(8000000, 750000)).toBe(9.375);
    expect(calculateConfirmedFundingProgress(8000000, 1000000)).toBe(12.5);
    expect(calculateConfirmedFundingProgress(8000000, 750000)).not.toBe(12.5);
  });

  it('does not expose a progress value when the funding target is invalid', () => {
    expect(calculateConfirmedFundingProgress(0, 100)).toBeNull();
    expect(calculateConfirmedFundingProgress(null, 100)).toBeNull();
  });
});
