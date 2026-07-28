import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Subject } from 'rxjs';
import { NotificationRefreshCoordinator } from './notification-refresh-coordinator.service';
import { NotificationService } from './notification.service';
import { FirebaseClientService, RealtimeEvent } from './firebase-client.service';
import { API_BASE } from '../config/api.token';

const API_BASE_VALUE = 'http://localhost:5235';

describe('NotificationRefreshCoordinator', () => {
  let coordinator: NotificationRefreshCoordinator;
  let notificationService: NotificationService;
  let firebaseClient: FirebaseClientService;
  let onRealtimeEvent: Subject<RealtimeEvent>;
  let hasRealtimeConnectionChange: Subject<boolean>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        NotificationRefreshCoordinator,
        NotificationService,
        FirebaseClientService,
        { provide: API_BASE, useValue: API_BASE_VALUE }
      ]
    });

    coordinator = TestBed.inject(NotificationRefreshCoordinator);
    notificationService = TestBed.inject(NotificationService);
    firebaseClient = TestBed.inject(FirebaseClientService);
    onRealtimeEvent = firebaseClient.onRealtimeEvent as Subject<RealtimeEvent>;
    hasRealtimeConnectionChange = firebaseClient.hasRealtimeConnectionChange as Subject<boolean>;
  });

  afterEach(() => {
    coordinator.stop();
  });

  describe('single coordinator start', () => {
    it('isRunning is false before start', () => {
      expect(coordinator.isRunning).toBeFalse();
    });

    it('isRunning is true after start', () => {
      coordinator.start();
      expect(coordinator.isRunning).toBeTrue();
    });

    it('calling start twice does not throw', () => {
      coordinator.start();
      coordinator.start();
      expect(coordinator.isRunning).toBeTrue();
    });

    it('isRunning is false after stop', () => {
      coordinator.start();
      coordinator.stop();
      expect(coordinator.isRunning).toBeFalse();
    });
  });

  describe('250ms debounce', () => {
    beforeEach(() => {
      coordinator.start();
    });

    it('debounces rapid events into single load', fakeAsync(() => {
      spyOn(notificationService, 'loadNotifications').and.resolveTo();

      onRealtimeEvent.next({ eventId: 'e1', type: 'NotificationCreated', entityId: '1', createdAt: Date.now() });
      onRealtimeEvent.next({ eventId: 'e2', type: 'NotificationCreated', entityId: '2', createdAt: Date.now() });
      onRealtimeEvent.next({ eventId: 'e3', type: 'NotificationCreated', entityId: '3', createdAt: Date.now() });

      tick(100);
      expect(notificationService.loadNotifications).not.toHaveBeenCalled();

      tick(200);
      expect(notificationService.loadNotifications).toHaveBeenCalledTimes(1);
    }));

    it('loads separately when events are spaced beyond debounce window', fakeAsync(() => {
      spyOn(notificationService, 'loadNotifications').and.resolveTo();

      onRealtimeEvent.next({ eventId: 'e1', type: 'NotificationCreated', entityId: '1', createdAt: Date.now() });
      tick(300);

      onRealtimeEvent.next({ eventId: 'e2', type: 'NotificationCreated', entityId: '2', createdAt: Date.now() });
      tick(300);

      expect(notificationService.loadNotifications).toHaveBeenCalledTimes(2);
    }));

    it('ignores non-NotificationCreated events', fakeAsync(() => {
      spyOn(notificationService, 'loadNotifications').and.resolveTo();

      onRealtimeEvent.next({ eventId: 'e1', type: 'OtherEvent', entityId: '1', createdAt: Date.now() });
      tick(300);

      expect(notificationService.loadNotifications).not.toHaveBeenCalled();
    }));

    it('refreshes unread counts when a conversation message arrives', fakeAsync(() => {
      spyOn(notificationService, 'loadNotifications').and.resolveTo();

      onRealtimeEvent.next({ eventId: 'm1', type: 'ConversationMessageSaved', entityId: 'message-1', createdAt: Date.now() });
      tick(300);

      expect(notificationService.loadNotifications).toHaveBeenCalledTimes(1);
    }));
  });

  describe('polling stop/resume', () => {
    beforeEach(() => {
      jasmine.clock().install();
    });

    afterEach(() => {
      jasmine.clock().uninstall();
    });

    it('starts polling on start', () => {
      spyOn(notificationService, 'loadNotifications').and.resolveTo();
      coordinator.start();
      expect(notificationService.loadNotifications).toHaveBeenCalledTimes(1);
    });

    it('stops polling on stop', () => {
      spyOn(notificationService, 'loadNotifications').and.resolveTo();
      coordinator.start();
      coordinator.stop();
      (notificationService.loadNotifications as jasmine.Spy).calls.reset();

      jasmine.clock().tick(60000);
      expect(notificationService.loadNotifications).not.toHaveBeenCalled();
    });

    it('resumes polling when Firebase disconnects', () => {
      spyOn(notificationService, 'loadNotifications').and.resolveTo();
      coordinator.start();
      (notificationService.loadNotifications as jasmine.Spy).calls.reset();

      hasRealtimeConnectionChange.next(true);
      jasmine.clock().tick(60000);
      (notificationService.loadNotifications as jasmine.Spy).calls.reset();

      hasRealtimeConnectionChange.next(false);
      expect(notificationService.loadNotifications).toHaveBeenCalled();

      jasmine.clock().tick(30000);
      expect(notificationService.loadNotifications).toHaveBeenCalledTimes(2);
    });

    it('polls every 30s', () => {
      spyOn(notificationService, 'loadNotifications').and.resolveTo();
      coordinator.start();
      (notificationService.loadNotifications as jasmine.Spy).calls.reset();

      jasmine.clock().tick(30000);
      expect(notificationService.loadNotifications).toHaveBeenCalledTimes(1);

      jasmine.clock().tick(30000);
      expect(notificationService.loadNotifications).toHaveBeenCalledTimes(2);
    });
  });

  describe('logout cleanup', () => {
    it('stops coordinator', () => {
      coordinator.start();
      expect(coordinator.isRunning).toBeTrue();

      coordinator.stop();
      expect(coordinator.isRunning).toBeFalse();
    });

    it('unsubscribes from Firebase events after stop', fakeAsync(() => {
      const spy = spyOn(notificationService, 'loadNotifications').and.resolveTo();

      coordinator.start();
      coordinator.stop();

      spy.calls.reset();

      onRealtimeEvent.next({ eventId: 'e1', type: 'NotificationCreated', entityId: '1', createdAt: Date.now() });
      tick(300);
      expect(spy).not.toHaveBeenCalled();
    }));
  });
});
