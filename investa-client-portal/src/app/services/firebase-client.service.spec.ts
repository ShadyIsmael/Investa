import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FirebaseClientService, RealtimeEvent } from './firebase-client.service';
import { API_BASE } from '../config/api.token';

describe('FirebaseClientService', () => {
  let service: FirebaseClientService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        FirebaseClientService,
        { provide: API_BASE, useValue: 'http://localhost:5235' }
      ]
    });
    service = TestBed.inject(FirebaseClientService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('hasRealtimeConnection starts as false', () => {
    expect(service.hasRealtimeConnection()).toBeFalse();
  });

  it('initialize should not throw when config is incomplete', () => {
    (window as any).__INVESTA_FIREBASE_CONFIG = undefined;
    expect(() => service.initialize()).not.toThrow();
  });

  it('disconnect should not throw when not connected', () => {
    expect(() => service.disconnect()).not.toThrow();
  });

  it('connectForUser should not throw when firebase not initialized', async () => {
    await expectAsync(service.connectForUser('test-user-id')).not.toBeRejected();
  });

  it('processedEventIdsCount starts at 0', () => {
    expect(service.processedEventIdsCount).toBe(0);
  });

  it('disconnect clears processedEventIdsCount', () => {
    service.disconnect();
    expect(service.processedEventIdsCount).toBe(0);
  });

  it('hasRealtimeConnectionChange emits on disconnect', () => {
    let emitted: boolean | undefined;
    service.hasRealtimeConnectionChange.subscribe(v => emitted = v);
    service.disconnect();
    expect(emitted).toBeFalse();
  });

  it('onRealtimeEvent is a Subject that can emit', fakeAsync(() => {
    let received: RealtimeEvent | undefined;
    service.onRealtimeEvent.subscribe(e => received = e);

    const event: RealtimeEvent = {
      eventId: 'abc123',
      type: 'TestEvent',
      entityId: 'entity-1',
      createdAt: Date.now()
    };
    service.onRealtimeEvent.next(event);

    expect(received).toEqual(event);
  }));
});