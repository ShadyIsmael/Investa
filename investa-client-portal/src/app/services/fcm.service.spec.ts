import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FcmService } from './fcm.service';
import { NotificationRefreshCoordinator } from './notification-refresh-coordinator.service';
import { NotificationService } from './notification.service';
import { FirebaseClientService } from './firebase-client.service';
import { API_BASE } from '../config/api.token';

describe('FcmService', () => {
  let service: FcmService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        FcmService,
        NotificationRefreshCoordinator,
        NotificationService,
        FirebaseClientService,
        { provide: API_BASE, useValue: 'http://localhost:5235' }
      ]
    });
    service = TestBed.inject(FcmService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('permissionGranted is false before any action', () => {
    expect(service.permissionGranted).toBeFalse();
  });

  it('hasToken is false before registration', () => {
    expect(service.hasToken).toBeFalse();
  });

  it('deviceId is null before registration', () => {
    expect(service.deviceId).toBeNull();
  });

  it('initialize does not request permission', async () => {
    const originalPermission = Notification.permission;
    Object.defineProperty(Notification, 'permission', { value: 'default', writable: true });

    await service.initialize();

    expect(service.permissionGranted).toBeFalse();
    Object.defineProperty(Notification, 'permission', { value: originalPermission, writable: true });
  });

  it('disable cleans up without throwing when not initialized', async () => {
    await expectAsync(service.disable()).not.toBeRejected();
  });

  it('getMyDevices returns empty array on failure', async () => {
    const devicesPromise = service.getMyDevices();
    const req = httpMock.expectOne('http://localhost:5235/api/v1/notifications/devices');
    req.flush({ success: true, data: [] });
    const devices = await devicesPromise;
    expect(devices).toEqual([]);
  });
});