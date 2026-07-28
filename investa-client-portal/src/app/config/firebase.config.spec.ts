import { DEFAULT_FIREBASE_CONFIG } from './firebase.config';

describe('FirebaseConfig', () => {
  it('should have required configuration keys', () => {
    expect(DEFAULT_FIREBASE_CONFIG.apiKey).toBeTruthy();
    expect(DEFAULT_FIREBASE_CONFIG.projectId).toBeTruthy();
    expect(DEFAULT_FIREBASE_CONFIG.authDomain).toBeTruthy();
    expect(DEFAULT_FIREBASE_CONFIG.databaseURL).toBeTruthy();
  });

  it('should have the correct project ID', () => {
    expect(DEFAULT_FIREBASE_CONFIG.projectId).toBe('fopx-3fb91');
  });
});