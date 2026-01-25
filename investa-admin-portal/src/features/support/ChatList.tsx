import React, { useRef, useLayoutEffect, useCallback } from 'react';
import { useChatStore } from '@/services/chatStore';
import { Icon } from '@/components/common/Icons';

export const ChatList: React.FC = React.memo(() => {
  const conversations = useChatStore(s => s.conversations);
  const activeConversationId = useChatStore(s => s.activeConversationId);
  const setActiveConversation = useChatStore(s => s.setActiveConversation);

  const listRef = useRef<HTMLDivElement | null>(null);
  const prevScrollHeightRef = React.useRef<number>(0);

  const handleSelect = useCallback((id: string) => setActiveConversation(id), [setActiveConversation]);

  // Preserve scroll position when list content height changes to avoid visual jumps
  useLayoutEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const newHeight = el.scrollHeight;
    const delta = newHeight - prevScrollHeightRef.current;
    if (Math.abs(delta) > 0) {
      el.scrollTop = el.scrollTop + delta;
    }
    prevScrollHeightRef.current = newHeight;
  }, [conversations]);

  return (
    <div className="w-80 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 h-full">
      <div className="p-4 border-b border-slate-100 dark:border-slate-800">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Chats</h3>
        <p className="text-sm text-slate-500">Real-time active conversations</p>
      </div>

      <div className="overflow-y-auto h-[calc(100vh-7rem)]" ref={listRef}>
        {conversations.length === 0 ? (
          <div className="p-4 text-sm text-slate-500">No conversations yet.</div>
        ) : (
          <ul className="p-2">
            {conversations.map(conv => (
              <li key={conv.id} className={`cursor-pointer p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${activeConversationId === conv.id ? 'bg-indigo-50 dark:bg-indigo-900/10' : ''}`} onClick={() => handleSelect(conv.id)}>
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 font-bold">{conv.userMobile.slice(-2)}</div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{conv.userMobile}</div>
                        <div className="text-[12px] text-slate-500 truncate">{conv.lastMessage}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end">
                    {conv.unreadCount > 0 ? (
                      <div className="bg-rose-500 text-white text-[12px] font-bold px-2 py-0.5 rounded-full">{conv.unreadCount}</div>
                    ) : (
                      <div className="text-[11px] text-slate-400">&nbsp;</div>
                    )}
                    <div className="text-[10px] text-slate-400 mt-1"><Icon name="clock" className="w-3.5 h-3.5" /></div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
});

export default ChatList;

(ChatList as unknown as React.FC).displayName = 'ChatList';
