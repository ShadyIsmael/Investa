import React from 'react';
import { ChatRequestPayload } from '@/types';
import { Icon } from '@/components/common/Icons';

interface Props {
  request: ChatRequestPayload;
  onClose: (id: string) => void;
}

export const ChatRequestToast: React.FC<Props> = ({ request, onClose }) => {
  return (
    <div className="max-w-xs w-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-lg p-3 flex items-start gap-3">
      <div className="flex-shrink-0">
        <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
          <Icon name="users" className="w-5 h-5 text-indigo-600" />
        </div>
      </div>
      <div className="flex-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{request.fromName || `User ${request.fromUserId}`}</div>
            <div className="text-[12px] text-slate-500 dark:text-slate-400 truncate">{request.message}</div>
          </div>
          <div className="text-right">
            <div className="text-[11px] text-slate-400">{new Date(request.createdAt).toLocaleTimeString()}</div>
            <button onClick={() => onClose(request.id)} title="Dismiss" className="mt-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
              <Icon name="x" className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatRequestToast;
