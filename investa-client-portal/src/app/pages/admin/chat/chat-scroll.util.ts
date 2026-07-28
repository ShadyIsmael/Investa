export interface MessageScrollTarget {
  scrollTop: number;
  readonly scrollHeight: number;
}

export function scrollToLatest(target: MessageScrollTarget | null | undefined): void {
  if (!target) return;
  target.scrollTop = target.scrollHeight;
}
