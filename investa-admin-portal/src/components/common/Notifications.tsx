import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

const Notifications: React.FC = () => {
  const [status, setStatus] = useState<'granted' | 'denied' | 'default'>('default');

  useEffect(() => {
    try {
      setStatus((Notification && Notification.permission) || 'default');
    } catch {
      setStatus('default');
    }

    let active = true;
    let unsubscribe: (() => void) | undefined;

    // Firebase is optional shell functionality; load it after the core shell mounts.
    void import('@/services/fcmService')
      .then(({ onMessageListener }) => {
        if (!active) return;
        unsubscribe = onMessageListener((payload) => {
          try {
            let title = 'Notification';
            let body = '';

            if (payload.notification) {
              title = payload.notification.title || title;
              body = payload.notification.body || '';
            } else if (payload.data) {
              title = payload.data.title || title;
              body = payload.data.body || payload.data.message || '';
            }

            toast.info(
              <div className="flex flex-col">
                <strong className="font-semibold text-sm">{title}</strong>
                {body && <div className="text-xs mt-1 text-gray-600">{body}</div>}
              </div>,
              {
                autoClose: 5000,
                closeButton: true,
              },
            );
          } catch {
            console.warn('[Notifications] Failed to show foreground message.');
          }
        });
      })
      .catch(() => console.warn('[Notifications] Notification integration is unavailable.'));

    return () => {
      active = false;
      unsubscribe?.();
    };
  }, []);

  const enable = async () => {
    const { requestPermissionAndGetToken } = await import('@/services/fcmService');
    const token = await requestPermissionAndGetToken();
    if (token) {
      setStatus('granted');
    } else {
      setStatus((Notification && Notification.permission) || 'default');
    }
  };

  if (status === 'granted') return null;

  if (status === 'denied') {
    return (
      <div className="fixed top-16 z-50" style={{ right: 'var(--spacing-4)' }}>
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-3 py-2 rounded shadow-sm text-sm">
          Notifications blocked. Please enable in your browser settings.
        </div>
      </div>
    );
  }

  // status === 'default' -> show action button
  return (
    <div className="fixed top-16 z-50" style={{ right: 'var(--spacing-4)' }}>
      <button
        onClick={enable}
        className="px-3 py-2 bg-indigo-600 text-white rounded shadow-md text-sm hover:bg-indigo-700 transition-colors"
      >
        🔔 Enable notifications
      </button>
    </div>
  );
};

export default Notifications;
