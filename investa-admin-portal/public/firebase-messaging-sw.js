/* eslint-disable no-undef */
// Firebase Messaging service worker - strict background message handler
// Replace 'REPLACE_WITH_MESSAGING_SENDER_ID' below with your actual Firebase messagingSenderId

importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

firebase.initializeApp({
  messagingSenderId: 'REPLACE_WITH_MESSAGING_SENDER_ID'
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('[SW] Background message received:', payload);
  
  // Strict parsing: handle both data-only and notification payloads
  let title = 'Notification';
  let body = '';
  let icon = '/favicon.ico';
  
  // Prefer notification object if present (FCM sends notification field for display messages)
  if (payload.notification) {
    title = payload.notification.title || title;
    body = payload.notification.body || '';
    icon = payload.notification.icon || icon;
  } else if (payload.data) {
    // Fallback to data payload if no notification field (data-only messages)
    title = payload.data.title || title;
    body = payload.data.body || payload.data.message || '';
    icon = payload.data.icon || icon;
  }
  
  const notificationOptions = {
    body: body,
    icon: icon,
    badge: '/favicon.ico',
    tag: 'investa-notification',
    requireInteraction: false
  };
  
  return self.registration.showNotification(title, notificationOptions);
});
