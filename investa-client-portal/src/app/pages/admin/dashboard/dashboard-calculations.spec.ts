import { sumParticipationValues } from './dashboard-calculations';

describe('dashboard portfolio calculations', () => {
  const approvedParticipations = [
    { model: 'loan', amount: 26_999.99, expectedNetReturn: 6_480 },
    { model: 'profitSharing', amount: 30_000, expectedNetReturn: 4_500 },
  ];

  it('includes every approved investment model in the invested total', () => {
    expect(sumParticipationValues(approvedParticipations, item => item.amount)).toBe(56_999.99);
  });

  it('includes every approved investment model in expected net return', () => {
    expect(sumParticipationValues(approvedParticipations, item => item.expectedNetReturn)).toBe(10_980);
  });
});
