export interface TimelineMessage {
  id: string;
  conversationId?: string;
  sentAt: string | Date;
}

export interface TimelineOffer {
  id: number;
  conversationId: string;
  createdAt?: string | Date | null;
}

export type ConversationTimelineItem<M extends TimelineMessage, O extends TimelineOffer> =
  | { kind: 'message'; id: string; date: string | Date; message: M }
  | { kind: 'offer'; id: string; date: string | Date; offer: O };

export function buildConversationTimeline<M extends TimelineMessage, O extends TimelineOffer>(
  conversationId: string,
  messages: readonly M[],
  offers: readonly O[]
): ConversationTimelineItem<M, O>[] {
  const unique = new Map<string, ConversationTimelineItem<M, O>>();

  for (const message of messages) {
    if (message.conversationId && message.conversationId !== conversationId) continue;
    unique.set(`message-${message.id}`, {
      kind: 'message',
      id: `message-${message.id}`,
      date: message.sentAt,
      message
    });
  }

  for (const offer of offers) {
    if (offer.conversationId !== conversationId) continue;
    unique.set(`offer-${offer.id}`, {
      kind: 'offer',
      id: `offer-${offer.id}`,
      date: offer.createdAt || new Date(0),
      offer
    });
  }

  return [...unique.values()].sort((left, right) => {
    const timestampDifference = new Date(left.date).getTime() - new Date(right.date).getTime();
    return timestampDifference || left.id.localeCompare(right.id);
  });
}
