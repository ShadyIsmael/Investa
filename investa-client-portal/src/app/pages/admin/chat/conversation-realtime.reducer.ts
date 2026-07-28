export interface OrderedMessage {
  id: string;
  sentAt: string | Date;
}

export interface ConversationPreview {
  id: string;
  lastMessage?: string;
  lastMessageAt?: string | Date | null;
  unreadCount?: number;
}

export interface SavedConversationMessage {
  messageId: string;
  conversationId: string;
  senderUserId: string;
  body: string;
  createdAt: string | Date;
  isRead?: boolean;
}

export function upsertAuthoritativeMessage<T extends OrderedMessage>(
  messages: readonly T[],
  message: T
): { items: T[]; inserted: boolean } {
  const existingIndex = messages.findIndex(item => item.id === message.id);
  const next = existingIndex >= 0
    ? messages.map((item, index) => index === existingIndex ? message : item)
    : [...messages, message];

  next.sort((left, right) => {
    const dateDifference = new Date(left.sentAt).getTime() - new Date(right.sentAt).getTime();
    return dateDifference || left.id.localeCompare(right.id);
  });
  return { items: next, inserted: existingIndex < 0 };
}

export function updateConversationPreview<T extends ConversationPreview>(
  conversations: readonly T[],
  message: SavedConversationMessage,
  currentUserId: string | null,
  activeConversationId: string | null,
  inserted: boolean
): T[] {
  return conversations.map(conversation => {
    if (conversation.id !== message.conversationId) return conversation;

    const fromCurrentUser = !!currentUserId && message.senderUserId === currentUserId;
    const activeForRecipient = activeConversationId === message.conversationId;
    const shouldIncrementUnread = inserted && !fromCurrentUser && !activeForRecipient;

    return {
      ...conversation,
      lastMessage: message.body,
      lastMessageAt: message.createdAt,
      unreadCount: shouldIncrementUnread
        ? (conversation.unreadCount ?? 0) + 1
        : activeForRecipient ? 0 : conversation.unreadCount ?? 0
    };
  });
}
