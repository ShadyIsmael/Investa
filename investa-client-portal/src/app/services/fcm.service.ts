import { Injectable, NgZone, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, deleteToken, Messaging } from 'firebase/messaging';
import { DEFAULT_FIREBASE_CONFIG, FIREBASE_VAPID_KEY } from '../config/firebase.config';
import { API_BASE } from '../config/api.token';
import { NotificationRefreshCoordinator } from './notification-refresh-coordinator.service';
import { NotificationService } from './notification.service';

export interface DeviceInfo {
  id: number;
  token: string;
  deviceId: string | null;
  browser: string | null;
  platform: string | null;
  isActive: boolean;
  createdAt: string;
  lastUsedAt: string | null;
}

@Injectable({ providedIn: 'root' })
export class FcmService {
  private apiBase = inject(API_BASE);
  private http = inject(HttpClient);
  private zone = inject(NgZone);
  private coordinator = inject(NotificationRefreshCoordinator);
  private notificationService = inject(NotificationService);

  private messaging: Messaging | null = null;
  private unsubForeground: (() => void) | null = null;
  private currentFcmToken: string | null = null;
  private currentDeviceId: number | null = null;
  private _permissionGranted = false;
  private _initialized = false;

  get permissionGranted(): boolean {
    return this._permissionGranted;
  }

  get hasToken(): boolean {
    return this.currentFcmToken !== null;
  }

  get deviceId(): number | null {
    return this.currentDeviceId;
  }

  async initialize(): Promise<void> {
    if (this._initialized) return;
    this._initialized = true;

    const apps = getApps();
    const app: FirebaseApp = apps.length > 0 ? apps[0] : initializeApp(DEFAULT_FIREBASE_CONFIG);
    this.messaging = getMessaging(app);

    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      this._permissionGranted = true;
    }
  }

  async enable(): Promise<boolean> {
    if (!this.messaging) await this.initialize();
    if (!this.messaging) return false;

    try {
      const permission = await this.zone.runOutsideAngular(() =>
        Notification.requestPermission()
      );

      if (permission !== 'granted') {
        this._permissionGranted = false;
        return false;
      }

      this._permissionGranted = true;

      const token = await this.zone.runOutsideAngular(() =>
        getToken(this.messaging!, { vapidKey: FIREBASE_VAPID_KEY })
      );

      if (!token) return false;

      this.currentFcmToken = token;

      const deviceId = this.detectDeviceId();
      const browser = this.detectBrowser();
      const platform = 'Web';

      const device = await this.registerTokenOnBackend(token, deviceId, browser, platform);
      if (device) {
        this.currentDeviceId = device.id;
      }

      this.startForegroundListener();
      return true;
    } catch (err) {
      console.warn('[FcmService] Failed to enable push notifications:', err);
      this._permissionGranted = false;
      return false;
    }
  }

  async disable(): Promise<void> {
    if (this.currentDeviceId !== null) {
      await this.deactivateOnBackend(this.currentDeviceId);
    }

    this.stopForegroundListener();

    if (this.messaging && this.currentFcmToken) {
      try {
        await this.zone.runOutsideAngular(() => deleteToken(this.messaging!));
      } catch {
        // ignore
      }
    }

    this.currentFcmToken = null;
    this.currentDeviceId = null;
    this._permissionGranted = false;
  }

  async getMyDevices(): Promise<DeviceInfo[]> {
    try {
      const headers = this.getHeaders();
      const raw = await firstValueFrom(
        this.http.get<{ success: boolean; data: DeviceInfo[] }>(
          `${this.apiBase}/api/v1/notifications/devices`,
          { headers }
        )
      );
      return raw.data || [];
    } catch {
      return [];
    }
  }

  private async registerTokenOnBackend(
    token: string,
    deviceId: string | null,
    browser: string | null,
    platform: string
  ): Promise<{ id: number } | null> {
    try {
      const headers = this.getHeaders();
      const raw = await firstValueFrom(
        this.http.post<{ success: boolean; data: { id: number } }>(
          `${this.apiBase}/api/v1/notifications/devices`,
          { token, deviceId, browser, platform },
          { headers }
        )
      );
      return raw.data || null;
    } catch {
      return null;
    }
  }

  private async deactivateOnBackend(deviceId: number): Promise<void> {
    try {
      const headers = this.getHeaders();
      await firstValueFrom(
        this.http.delete(`${this.apiBase}/api/v1/notifications/devices/${deviceId}`, { headers })
      );
    } catch {
      // ignore
    }
  }

  private startForegroundListener(): void {
    this.stopForegroundListener();

    if (!this.messaging) return;

    const unsubscribe = onMessage(this.messaging, (payload) => {
      this.zone.run(() => {
        const data = payload.data || {};

        const notificationType = data['notificationType'] || '';

        if (notificationType === 'NotificationCreated' || !notificationType) {
          this.coordinator.manualRefresh();
        }

        const title = data['title'] || payload.notification?.title || '';
        const body = data['body'] || payload.notification?.body || '';
        if (title || body) {
          this.notificationService.showToast({
            title: title || 'Notification',
            message: body || '',
            type: 'info',
          });
        }
      });
    });

    this.unsubForeground = () => unsubscribe();
  }

  private stopForegroundListener(): void {
    if (this.unsubForeground) {
      this.unsubForeground();
      this.unsubForeground = null;
    }
  }

  private detectDeviceId(): string | null {
    let id = localStorage.getItem('fcm_device_id');
    if (!id) {
      id = 'web_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
      localStorage.setItem('fcm_device_id', id);
    }
    return id;
  }

  private detectBrowser(): string {
    const ua = navigator.userAgent;
    if (ua.includes('Edg')) return 'Edge';
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari')) return 'Safari';
    return 'Unknown';
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('accessToken');
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }

  }