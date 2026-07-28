export function sumParticipationValues<T>(items: readonly T[], selectValue: (item: T) => number): number {
  const total = items.reduce((sum, item) => {
    const value = Number(selectValue(item));
    return sum + (Number.isFinite(value) ? value : 0);
  }, 0);
  return Math.round((total + Number.EPSILON) * 100) / 100;
}
