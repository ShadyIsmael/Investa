import { buildConversationTimeline } from './conversation-timeline.reducer';

describe('buildConversationTimeline', () => {
  it('filters the active conversation, sorts authoritatively, and removes duplicates', () => {
    const result = buildConversationTimeline(
      'conversation-a',
      [
        { id: 'm2', conversationId: 'conversation-a', sentAt: '2026-07-24T10:02:00Z' },
        { id: 'm1', conversationId: 'conversation-a', sentAt: '2026-07-24T10:00:00Z' },
        { id: 'm2', conversationId: 'conversation-a', sentAt: '2026-07-24T10:02:00Z' },
        { id: 'stale', conversationId: 'conversation-b', sentAt: '2026-07-24T09:00:00Z' }
      ],
      [
        { id: 7, conversationId: 'conversation-a', createdAt: '2026-07-24T10:01:00Z' },
        { id: 8, conversationId: 'conversation-b', createdAt: '2026-07-24T10:01:30Z' }
      ]
    );

    expect(result.map(item => item.id)).toEqual(['message-m1', 'offer-7', 'message-m2']);
  });

  it('returns no stale items after switching conversations', () => {
    const result = buildConversationTimeline(
      'conversation-b',
      [{ id: 'm1', conversationId: 'conversation-a', sentAt: '2026-07-24T10:00:00Z' }],
      [{ id: 7, conversationId: 'conversation-a', createdAt: '2026-07-24T10:01:00Z' }]
    );

    expect(result).toEqual([]);
  });
});
