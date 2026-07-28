import {
  SavedConversationMessage,
  updateConversationPreview,
  upsertAuthoritativeMessage
} from './conversation-realtime.reducer';

describe('conversation realtime reducer', () => {
  const saved: SavedConversationMessage = {
    messageId: 'm2',
    conversationId: 'c1',
    senderUserId: 'other',
    body: 'Saved body',
    createdAt: '2026-07-24T10:00:00Z'
  };

  it('deduplicates API and Firebase copies by authoritative message id', () => {
    const first = upsertAuthoritativeMessage([], { id: 'm2', sentAt: saved.createdAt, text: 'first' });
    const replay = upsertAuthoritativeMessage(first.items, { id: 'm2', sentAt: saved.createdAt, text: 'saved' });

    expect(first.inserted).toBeTrue();
    expect(replay.inserted).toBeFalse();
    expect(replay.items.length).toBe(1);
    expect(replay.items[0].text).toBe('saved');
  });

  it('orders by authoritative createdAt and message id', () => {
    const result = upsertAuthoritativeMessage(
      [
        { id: 'm3', sentAt: '2026-07-24T11:00:00Z' },
        { id: 'm1', sentAt: '2026-07-24T09:00:00Z' }
      ],
      { id: 'm2', sentAt: saved.createdAt }
    );

    expect(result.items.map(item => item.id)).toEqual(['m1', 'm2', 'm3']);
  });

  it('updates preview and increments recipient unread once', () => {
    const conversations = [{ id: 'c1', unreadCount: 2, lastMessage: '' }];
    const first = updateConversationPreview(conversations, saved, 'recipient', null, true);
    const replay = updateConversationPreview(first, saved, 'recipient', null, false);

    expect(first[0].lastMessage).toBe('Saved body');
    expect(first[0].unreadCount).toBe(3);
    expect(replay[0].unreadCount).toBe(3);
  });

  it('does not increment unread for an open recipient conversation', () => {
    const result = updateConversationPreview(
      [{ id: 'c1', unreadCount: 4 }],
      saved,
      'recipient',
      'c1',
      true
    );

    expect(result[0].unreadCount).toBe(0);
  });

  it('does not increment unread for the sender across tabs', () => {
    const result = updateConversationPreview(
      [{ id: 'c1', unreadCount: 0 }],
      saved,
      'other',
      null,
      true
    );

    expect(result[0].unreadCount).toBe(0);
  });
});
