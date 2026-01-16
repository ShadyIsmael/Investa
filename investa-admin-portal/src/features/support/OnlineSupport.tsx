import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Icon } from '@/components/common/Icons';
import { supportService } from '@/services/supportService';
import { useChatStore } from '@/services/chatStore';
import { MOCK_SUPPORT_SESSIONS, MOCK_SUPPORT_CONVERSATIONS } from '@/mocks/support';

const initialSessions = MOCK_SUPPORT_SESSIONS.map(s => ({ ...s }));

const fmt = (iso?: string) => {
  if (!iso) return '-';
  const d = new Date(iso);
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
};

export const OnlineSupport: React.FC = () => {
  // DEPRECATED: Online Support screen removed.
  // Keep a minimal stub to avoid accidental runtime errors if imported elsewhere.
  return <div className="p-6 text-slate-500">The Online Support screen has been removed.</div>;
};

export default OnlineSupport;
