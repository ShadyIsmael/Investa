import { Injectable, NgZone, inject, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { NotificationService } from './notification.service';
import { FirebaseClientService } from './firebase-client.service';

@Injectable({ providedIn: 'root' })
export class NotificationRefreshCoordinator implements OnDestroy {
  private zone = inject(NgZone);
  private notificationService = inject(NotificationService);
  private firebaseClient = inject(FirebaseClientService);

  private readonly POLL_INTERVAL_MS = 30_000;
  private readonly DEBOUNCE_MS = 250;
  private pollTimer: ReturnType<typeof setInterval> | null = null;
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private subscriptions = new Subscription();
  private started = false;

  ngOnDestroy(): void {
    this.stop();
  }

  get isRunning(): boolean {
    return this.started;
  }

  start(): void {
    if (this.started) return;
    this.started = true;

    this.startPolling();

    this.subscriptions.add(
      this.firebaseClient.onRealtimeEvent.subscribe(event => {
        if (event.type === 'NotificationCreated' || event.type === 'ConversationMessageSaved') {
          this.debouncedRefresh();
        }
      })
    );

    this.subscriptions.add(
      this.firebaseClient.hasRealtimeConnectionChange.subscribe(connected => {
        if (connected) {
          this.loadNotifications();
          this.stopPolling();
        } else {
          this.startPolling();
        }
      })
    );
  }

  stop(): void {
    this.started = false;
    this.stopPolling();
    this.cancelDebounce();
    this.subscriptions.unsubscribe();
    this.subscriptions = new Subscription();
  }

  async manualRefresh(): Promise<void> {
    await this.loadNotifications();
  }

  private debouncedRefresh(): void {
    this.cancelDebounce();
    this.debounceTimer = setTimeout(() => {
      this.debounceTimer = null;
      this.loadNotifications();
    }, this.DEBOUNCE_MS);
  }

  private cancelDebounce(): void {
    if (this.debounceTimer !== null) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
  }

  startPolling(): void {
    this.stopPolling();
    this.loadNotifications();
    this.pollTimer = setInterval(() => this.loadNotifications(), this.POLL_INTERVAL_MS);
  }

  stopPolling(): void {
    if (this.pollTimer !== null) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
  }

  private async loadNotifications(): Promise<void> {
    try {
      await this.notificationService.loadNotifications();
    } catch {
      // Silently ignore
    }
  }
}
