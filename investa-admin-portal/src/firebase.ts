import { initializeApp } from 'firebase/app';
import { getMessaging, isSupported as messagingIsSupported, Messaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

export async function getFirebaseMessaging(): Promise<Messaging | null> {
  try {
    const supported = await messagingIsSupported();
    if (!supported) return null;
    return getMessaging(app);
  } catch (e) {
    console.warn('FCM not supported in this environment', e);
    return null;
  }
}
