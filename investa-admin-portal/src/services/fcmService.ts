import { getFirebaseMessaging } from '@/firebase';
import { getToken, onMessage } from 'firebase/messaging';
import { api } from '@/api/api';
import { toast } from 'react-toastify';

const TOKEN_KEY = 'fcm_token';
type MessageCallback = (payload: any) => void;

const foregroundCallbacks = new Set<MessageCallback>();
let foregroundListenerPromise: Promise<void> | null = null;

export async function requestPermissionAndGetToken(): Promise<string | null> {
  try {
    if (!('Notification' in window)) {
      console.warn('Notifications not supported in this browser');
      return null;
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('Notification permission denied');
      return null;
    }

    const messaging = await getFirebaseMessaging();
    if (!messaging) {
      console.warn('Firebase Messaging not supported');
      return null;
    }

    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY as string | undefined;
    if (!vapidKey) {
      console.error('VITE_FIREBASE_VAPID_KEY not configured');
      toast.error('Notification configuration missing');
      return null;
    }

    const token = await getToken(messaging, { vapidKey });
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
      console.log('[FCM] Token obtained:', token.substring(0, 20) + '...');
      
      // Send token to backend
      sendTokenToServer(token).catch(err => {
        console.warn('Failed to send token to server:', err);
      });
      
      toast.success('Push notifications enabled');
      return token;
    }
    
    console.warn('Failed to get FCM token');
    return null;
  } catch (err) {
    console.error('FCM get token error:', err);
    toast.error('Failed to enable notifications');
    return null;
  }
}

export async function sendTokenToServer(token: string) {
  try {
    // Backend endpoint to store user's FCM token
    await api.post('/api/users/fcm-token', { fcmToken: token });
    console.log('[FCM] Token sent to server');
  } catch (err) {
    console.warn('[FCM] Failed to send token to server:', err);
    throw err;
  }
}

export function onMessageListener(cb: MessageCallback): () => void {
  foregroundCallbacks.add(cb);

  if (!foregroundListenerPromise) {
    foregroundListenerPromise = getFirebaseMessaging().then(messaging => {
    if (!messaging) {
      console.warn('[FCM] Messaging not available for foreground listener');
      return;
    }
    
    try {
      onMessage(messaging, (payload) => {
        console.log('[FCM] Foreground message received:', payload);
        foregroundCallbacks.forEach(callback => {
          try {
            callback(payload);
          } catch (e) {
            console.error('[FCM] Foreground callback failed:', e);
          }
        });
      });
      console.log('[FCM] Foreground listener registered');
    } catch (e) {
      console.error('[FCM] Failed to register foreground listener:', e);
      foregroundListenerPromise = null;
    }
  });
  }

  return () => {
    foregroundCallbacks.delete(cb);
  };
}

export function getCachedToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
