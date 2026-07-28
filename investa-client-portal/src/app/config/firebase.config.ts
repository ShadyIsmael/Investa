export interface FirebaseAppConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId: string;
  databaseURL: string;
}

export const DEFAULT_FIREBASE_CONFIG: FirebaseAppConfig = {
  apiKey: 'AIzaSyCpceYVZQEwoOWLawMsYJts3AexTu_drJk',
  authDomain: 'fopx-3fb91.firebaseapp.com',
  projectId: 'fopx-3fb91',
  storageBucket: 'fopx-3fb91.firebasestorage.app',
  messagingSenderId: '868848316152',
  appId: '1:868848316152:web:fe92f52834d374d613150d',
  measurementId: 'G-9R9JS4BZQL',
  databaseURL: 'https://fopx-3fb91-default-rtdb.europe-west1.firebasedatabase.app'
};

export const FIREBASE_VAPID_KEY = 'BBE5wwOsme27eCvmED6eT6cY80uGkpntxAtVE2ujOj9aDFtowhuZsSum9rZUwZpg991gJnpl-Q1lDiilrpV-cm8';