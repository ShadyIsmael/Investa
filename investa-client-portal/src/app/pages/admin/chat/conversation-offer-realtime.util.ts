export interface OfferRealtimeEvent {
  type: string;
  entityId?: unknown;
  data?: Record<string, unknown> | null;
}

export type NormalizedOfferStatus = 1 | 2 | 3 | 4 | 5;

const OFFER_STATUS_BY_NAME: Record<string, NormalizedOfferStatus> = {
  pending: 1,
  replaced: 2,
  accepted: 3,
  rejected: 4,
  withdrawn: 5
};

export function normalizeOfferStatus(value: unknown): NormalizedOfferStatus {
  if (typeof value === 'string') {
    const normalizedName = value.trim().toLowerCase();
    if (normalizedName in OFFER_STATUS_BY_NAME) {
      return OFFER_STATUS_BY_NAME[normalizedName];
    }
  }

  const numericStatus = Number(value);
  return numericStatus >= 1 && numericStatus <= 5
    ? numericStatus as NormalizedOfferStatus
    : 1;
}

export function offerConversationId(event: OfferRealtimeEvent): string | null {
  if (event.type !== 'ConversationOffersChanged' || !event.data) return null;

  const value = event.data['conversationId'] ?? event.entityId;
  if (typeof value === 'string') {
    const normalized = value.trim();
    return normalized || null;
  }

  return value === null || value === undefined ? null : String(value);
}

export function offerRealtimeAction(event: OfferRealtimeEvent): string | null {
  if (event.type !== 'ConversationOffersChanged' || !event.data) return null;
  const value = event.data['action'];
  return typeof value === 'string' && value.trim() ? value.trim().toLowerCase() : null;
}
