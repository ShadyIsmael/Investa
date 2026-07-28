import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { NotificationService } from './notification.service';
import { FirebaseClientService } from './firebase-client.service';
import { NotificationRefreshCoordinator } from './notification-refresh-coordinator.service';
import { API_BASE } from '../config/api.token';

describe('AuthService Firebase Integration', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let firebaseSpy: jasmine.SpyObj<FirebaseClientService>;
  let coordinatorSpy: jasmine.SpyObj<NotificationRefreshCoordinator>;

  beforeEach(() => {
    firebaseSpy = jasmine.createSpyObj('FirebaseClientService', [
      'initialize', 'connectForUser', 'disconnect'
    ]);
    coordinatorSpy = jasmine.createSpyObj('NotificationRefreshCoordinator', [
      'start', 'stop'
    ]);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        NotificationService,
        { provide: API_BASE, useValue: 'http://localhost:5235' },
        { provide: FirebaseClientService, useValue: firebaseSpy },
        { provide: NotificationRefreshCoordinator, useValue: coordinatorSpy }
      ]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);

    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('logout calls firebaseClient.disconnect', () => {
    service.logout();
    expect(firebaseSpy.disconnect).toHaveBeenCalled();
  });

  it('logout calls coordinator.stop', () => {
    service.logout();
    expect(coordinatorSpy.stop).toHaveBeenCalled();
  });

  it('logout does not throw when firebase not initialized', () => {
    expect(() => service.logout()).not.toThrow();
  });

  it('login does not call coordinator.start', async () => {
    const loginPromise = service.login('+1234567890', 'password123');

    const req = httpMock.expectOne('http://localhost:5235/api/v1/auth/login');
    expect(req.request.method).toBe('POST');
    req.flush({
      success: true,
      message: 'Login successful',
      data: {
        token: 'test-jwt-token',
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
        phoneNumber: '+1234567890'
      }
    });

    await loginPromise;

    expect(service.isAuthenticated()).toBeTrue();
    expect(coordinatorSpy.start).not.toHaveBeenCalled();
  });

  it('initialize restores session from existing token', async () => {
    localStorage.setItem('accessToken', 'existing-token');
    localStorage.setItem('tokenExpiresAt', new Date(Date.now() + 3600000).toISOString());
    localStorage.setItem('userRole', 'Client');

    await service.initialize();

    expect(service.isAuthenticated()).toBeTrue();
    expect(coordinatorSpy.start).not.toHaveBeenCalled();
  });

  it('initialize clears session for expired token', async () => {
    localStorage.setItem('accessToken', 'expired-token');
    localStorage.setItem('tokenExpiresAt', new Date(Date.now() - 3600000).toISOString());

    await service.initialize();

    expect(service.isAuthenticated()).toBeFalse();
  });
});