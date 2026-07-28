import { scrollToLatest } from './chat-scroll.util';

describe('chat auto-scroll', () => {
  it('scrolls to the newest optimistic or reconciled sent message', () => {
    const stream = { scrollTop: 0, scrollHeight: 640 };

    scrollToLatest(stream);

    expect(stream.scrollTop).toBe(640);
  });

  it('scrolls to the newest Firebase-received message', () => {
    const stream = { scrollTop: 120, scrollHeight: 980 };

    scrollToLatest(stream);

    expect(stream.scrollTop).toBe(980);
  });
});
