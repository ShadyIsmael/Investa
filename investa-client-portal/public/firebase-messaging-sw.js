importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyCpceYVZQEwoOWLawMsYJts3AexTu_drJk',
  authDomain: 'fopx-3fb91.firebaseapp.com',
  projectId: 'fopx-3fb91',
  storageBucket: 'fopx-3fb91.firebasestorage.app',
  messagingSenderId: '868848316152',
  appId: '1:868848316152:web:fe92f52834d374d613150d',
  measurementId: 'G-9R9JS4BZQL',
  databaseURL: 'https://fopx-3fb91-default-rtdb.europe-west1.firebasedatabase.app'
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const data = payload.data || {};

  const notificationId = data.notificationId || '0';
  const title = data.title || payload.notification?.title || 'New Notification';
  const body = data.body || payload.notification?.body || '';
  const targetUrl = data.targetUrl || '';
  const notificationType = data.notificationType || 'info';
  const entityId = data.entityId || '';

  const notificationOptions = {
    body: body,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'fopx-notification-' + notificationId,
    data: {
      notificationId: notificationId,
      notificationType: notificationType,
      entityId: entityId,
      targetUrl: targetUrl,
      clickAction: targetUrl
    },
    vibrate: [200, 100, 200]
  };

  self.registration.showNotification(title, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const data = event.notification.data || {};
  const targetUrl = data.targetUrl || '';
  const baseUrl = self.location.origin;

  let resolvedUrl = baseUrl;

  if (targetUrl && targetUrl.startsWith('/')) {
    resolvedUrl = baseUrl + targetUrl;
  } else if (targetUrl && targetUrl.startsWith(baseUrl)) {
    resolvedUrl = targetUrl;
  } else {
    resolvedUrl = baseUrl + '/admin/dashboard';
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === resolvedUrl && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(resolvedUrl);
      }
    })
  );
});