import { initializeApp } from 'firebase/app';
import { getMessaging, isSupported as messagingIsSupported, Messaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Only initialize Firebase when required configuration values are present
let app: any = null;
if (firebaseConfig.projectId && firebaseConfig.appId) {
  try {
    app = initializeApp(firebaseConfig);
  } catch (e) {
    console.warn('Failed to initialize Firebase app:', e);
    app = null;
  }
} else {
  // Helpful dev-time warning without throwing runtime errors
  // eslint-disable-next-line no-console
  console.warn('[firebase] Incomplete configuration - Firebase services disabled (projectId/appId missing).');
}

export async function getFirebaseMessaging(): Promise<Messaging | null> {
  try {
    if (!app) return null;
    const supported = await messagingIsSupported();
    if (!supported) return null;
    return getMessaging(app);
  } catch (e) {
    console.warn('FCM not supported in this environment', e);
    return null;
  }
}
