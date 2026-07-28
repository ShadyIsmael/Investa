import { Injectable, signal, computed, NgZone, inject, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, Subject } from 'rxjs';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, signOut, Auth } from 'firebase/auth';
import { getDatabase, ref, onChildAdded, off, DataSnapshot, Database } from 'firebase/database';
import { DEFAULT_FIREBASE_CONFIG, FirebaseAppConfig } from '../config/firebase.config';
import { API_BASE } from '../config/api.token';
import { ApiResponse } from '../models/api-response.model';

interface CustomTokenResponse {
  customToken: string;
  expiresInSeconds: number;
}

export interface RealtimeEvent {
  eventId: string;
  type: string;
  entityId: string;
  createdAt: number;
  data?: Record<string, unknown>;
}

@Injectable({ providedIn: 'root' })
export class FirebaseClientService {
  private static readonly MAX_CACHED_IDS = 500;

  private http = inject(HttpClient);
  private zone = inject(NgZone);

  readonly onRealtimeEvent = new Subject<RealtimeEvent>();
  readonly hasRealtimeConnectionChange = new Subject<boolean>();

  private firebaseApp: FirebaseApp | null = null;
  private firebaseAuth: Auth | null = null;
  private firebaseDb: Database | null = null;
  private currentListenerPath: string | null = null;
  private listenerCleanup: (() => void) | null = null;
  private connectionTimestamp: number = 0;
  private processedEventIds = new Set<string>();
  private _hasRealtimeConnection = signal<boolean>(false);

  readonly hasRealtimeConnection = computed(() => this._hasRealtimeConnection());

  constructor(@Inject(API_BASE) private apiBase: string) {}

  initialize(): void {
    if (this.firebaseApp) return;

    try {
      const config: FirebaseAppConfig = (window as any).__INVESTA_FIREBASE_CONFIG || DEFAULT_FIREBASE_CONFIG;

      if (!config.apiKey || !config.projectId) {
        console.warn('[FirebaseClient] Firebase configuration incomplete. Skipping initialization.');
        return;
      }

      this.firebaseApp = initializeApp(config);
      this.firebaseAuth = getAuth(this.firebaseApp);
      this.firebaseDb = getDatabase(this.firebaseApp);

      console.info('[FirebaseClient] Firebase app initialized.', config.projectId);
    } catch (err) {
      console.warn('[FirebaseClient] Failed to initialize Firebase:', err);
      this.firebaseApp = null;
      this.firebaseAuth = null;
      this.firebaseDb = null;
    }
  }

  async connectForUser(userId: string): Promise<void> {
    if (!this.firebaseAuth || !this.firebaseDb || !userId) return;

    this.disconnect();

    this.processedEventIds.clear();
    this.connectionTimestamp = Date.now();

    const signedIn = await this.signInWithBackendToken();
    if (!signedIn) return;

    this.startEventListener(userId);
    this.setConnectionState(true);
  }

  disconnect(): void {
    this.removeEventListener();
    this.setConnectionState(false);
    this.processedEventIds.clear();

    if (this.firebaseAuth?.currentUser) {
      signOut(this.firebaseAuth).catch(() => {});
    }
  }

  get processedEventIdsCount(): number {
    return this.processedEventIds.size;
  }

  private setConnectionState(connected: boolean): void {
    this._hasRealtimeConnection.set(connected);
    this.hasRealtimeConnectionChange.next(connected);
  }

  private async signInWithBackendToken(): Promise<boolean> {
    if (!this.firebaseAuth) return false;

    try {
      const token = await this.requestCustomToken();
      if (!token) return false;

      await signInWithCustomToken(this.firebaseAuth, token);
      return true;
    } catch (err) {
      console.warn('[FirebaseClient] Custom token sign-in failed:', err);
      return false;
    }
  }

  private async requestCustomToken(): Promise<string | null> {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return null;

      const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
      const raw = await firstValueFrom(
        this.http.post<ApiResponse<CustomTokenResponse>>(
          `${this.apiBase}/api/v1/firebase/custom-token`,
          {},
          { headers }
        )
      );

      if (!raw?.success || !raw.data?.customToken) {
        console.warn('[FirebaseClient] Custom token response invalid');
        return null;
      }

      return raw.data.customToken;
    } catch (err) {
      console.warn('[FirebaseClient] Failed to request custom token:', err);
      return null;
    }
  }

  private startEventListener(userId: string): void {
    const path = `/users/${userId}/events`;
    this.currentListenerPath = path;
    const dbRef = ref(this.firebaseDb!, path);

    const callback = (snapshot: DataSnapshot) => {
      const eventId = snapshot.key;
      if (!eventId) return;

      if (this.processedEventIds.has(eventId)) return;
      this.trackEventId(eventId);

      const eventData = snapshot.val() as any;
      if (!eventData) return;
      if (!eventData.type || !eventData.entityId) return;

      const eventCreatedAt = eventData.createdAt || 0;
      if (eventCreatedAt <= this.connectionTimestamp) return;

      this.zone.run(() => {
        this.onRealtimeEvent.next({
          eventId,
          type: eventData.type,
          entityId: eventData.entityId,
          createdAt: eventCreatedAt,
          data: eventData.data && typeof eventData.data === 'object' ? eventData.data : undefined,
        });
      });
    };

    onChildAdded(dbRef, callback);

    this.listenerCleanup = () => {
      off(dbRef, 'child_added', callback);
    };
  }

  private trackEventId(eventId: string): void {
    this.processedEventIds.add(eventId);
    if (this.processedEventIds.size > FirebaseClientService.MAX_CACHED_IDS) {
      const ids = Array.from(this.processedEventIds);
      const toRemove = ids.slice(0, ids.length - FirebaseClientService.MAX_CACHED_IDS);
      for (const id of toRemove) {
        this.processedEventIds.delete(id);
      }
    }
  }

  private removeEventListener(): void {
    if (this.listenerCleanup) {
      this.listenerCleanup();
      this.listenerCleanup = null;
    }
    this.currentListenerPath = null;
  }
}
