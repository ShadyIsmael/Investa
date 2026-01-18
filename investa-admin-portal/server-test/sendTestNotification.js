/**
 * Firebase Cloud Messaging Test Script (Server-side)
 * 
 * Usage:
 *   1. Install: npm install firebase-admin
 *   2. Download service account key from Firebase Console
 *   3. Save as serviceAccountKey.json in this directory
 *   4. Replace USER_FCM_TOKEN with actual token from browser
 *   5. Run: node sendTestNotification.js
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Replace with actual FCM token from user's browser (check console logs)
const USER_FCM_TOKEN = 'REPLACE_WITH_ACTUAL_FCM_TOKEN';

// Test Notification Message
const notificationMessage = {
  notification: {
    title: 'Test Notification',
    body: 'This is a test push notification from the server'
  },
  token: USER_FCM_TOKEN
};

// Test Data-Only Message
const dataMessage = {
  data: {
    title: 'Data Message Test',
    body: 'This is a data-only push notification',
    customField: 'customValue',
    timestamp: Date.now().toString()
  },
  token: USER_FCM_TOKEN
};

async function sendTestNotification() {
  console.log('📤 Sending test notification...\n');
  
  try {
    // Send notification message
    const response1 = await admin.messaging().send(notificationMessage);
    console.log('✅ Notification message sent successfully!');
    console.log('Response ID:', response1, '\n');
    
    // Wait 2 seconds
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Send data-only message
    const response2 = await admin.messaging().send(dataMessage);
    console.log('✅ Data message sent successfully!');
    console.log('Response ID:', response2, '\n');
    
    console.log('🎉 All test messages sent!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error sending notification:');
    console.error(error);
    process.exit(1);
  }
}

sendTestNotification();
