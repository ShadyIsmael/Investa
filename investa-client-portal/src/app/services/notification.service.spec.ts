import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { API_BASE } from '../config/api.token';
import { Notification, NotificationService } from './notification.service';

describe('NotificationService click handling', () => {
  let service: NotificationService;
  let http: HttpTestingController;
  let router: jasmine.SpyObj<Router>;

  const unread = (actionUrl: string | null = '/admin/chat?conversationId=abc'): Notification => ({
    id: 7,
    title: 'Notification',
    message: 'Body',
    timestamp: new Date(),
    read: false,
    type: 'info',
    actionUrl
  });

  beforeEach(() => {
    router = jasmine.createSpyObj<Router>('Router', ['navigateByUrl']);
    router.navigateByUrl.and.resolveTo(true);
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        NotificationService,
        { provide: API_BASE, useValue: 'http://localhost:5235' },
        { provide: Router, useValue: router }
      ]
    });
    service = TestBed.inject(NotificationService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads the dropdown from the same endpoint as the full notifications page', async () => {
    localStorage.setItem('accessToken', 'token');
    const loading = service.loadNotifications();

    http.expectOne('http://localhost:5235/api/v1/notifications/me').flush({
      success: true,
      message: 'OK',
      data: [{
        id: 7,
        title: 'Existing notification',
        message: 'Loaded immediately',
        createdAt: new Date().toISOString(),
        isRead: false,
        actionUrl: '/admin/requests',
        type: 'success'
      }]
    });
    http.expectOne('http://localhost:5235/api/v1/notifications/me/unread-count')
      .flush({ success: true, message: 'OK', data: { unreadCount: 14, notificationCount: 11, messageCount: 3 } });
    http.expectOne('http://localhost:5235/api/v1/conversations')
      .flush({ success: true, message: 'OK', data: [{ unreadCount: 2 }, { unreadCount: 1 }] });
    await loading;

    expect(service.notifications().length).toBe(1);
    expect(service.unreadCount()).toBe(11);
    expect(service.unreadMessageCount()).toBe(3);
    expect(service.notifications()[0].actionUrl).toBe('/admin/requests');
    localStorage.removeItem('accessToken');
  });

  it('marks unread once, decrements count once, then opens the conversation', async () => {
    const notification = unread();
    service.setNotifications([notification]);
    expect(service.unreadCount()).toBe(0);
    expect(service.unreadMessageCount()).toBe(1);

    const result = service.openNotification(notification);
    expect(service.notifications()[0].read).toBeTrue();
    expect(service.unreadCount()).toBe(0);
    expect(service.unreadMessageCount()).toBe(0);
    http.expectOne('http://localhost:5235/api/v1/notifications/me/7/read').flush({ success: true });
    await result;

    expect(router.navigateByUrl).toHaveBeenCalledOnceWith('/admin/chat?conversationId=abc');
  });

  it('does not call mark-read for an already read notification', async () => {
    const notification = { ...unread('/admin/opportunities/3'), read: true };
    service.setNotifications([notification]);
    await service.openNotification(notification);
    http.expectNone('http://localhost:5235/api/v1/notifications/me/7/read');
    expect(router.navigateByUrl).toHaveBeenCalledOnceWith('/admin/opportunities/3');
  });

  it('opens project-room routes for project updates, documents, milestones and accepted offers', async () => {
    const notification = { ...unread('/admin/opportunities/3/room'), read: true };
    service.setNotifications([notification]);
    await service.openNotification(notification);
    expect(router.navigateByUrl).toHaveBeenCalledOnceWith('/admin/opportunities/3/room');
  });

  it('falls back for missing, external, malformed and legacy routes', () => {
    expect(service.resolveTargetUrl(null)).toBe('/admin/notifications');
    expect(service.resolveTargetUrl('https://example.com')).toBe('/admin/notifications');
    expect(service.resolveTargetUrl('/admin/unknown/3')).toBe('/admin/notifications');
    expect(service.resolveTargetUrl('/admin/investments/3')).toBe('/admin/investments/3');
  });

  it('navigates even when mark-as-read fails', async () => {
    const notification = unread('/admin/requests');
    service.setNotifications([notification]);
    const result = service.openNotification(notification);
    http.expectOne('http://localhost:5235/api/v1/notifications/me/7/read')
      .flush({ message: 'temporary' }, { status: 503, statusText: 'Unavailable' });
    await result;
    expect(router.navigateByUrl).toHaveBeenCalledOnceWith('/admin/requests');
  });

  it('prevents duplicate clicks while the first mark-as-read is pending', async () => {
    const notification = unread('/admin/requests');
    service.setNotifications([notification]);
    const first = service.openNotification(notification);
    const second = service.openNotification(notification);
    const request = http.expectOne('http://localhost:5235/api/v1/notifications/me/7/read');
    request.flush({ success: true });
    await Promise.all([first, second]);
    expect(router.navigateByUrl).toHaveBeenCalledTimes(1);
  });

  it('standalone mark-as-read never navigates', async () => {
    const notification = unread();
    service.setNotifications([notification]);
    const result = service.markAsRead(notification.id);
    http.expectOne('http://localhost:5235/api/v1/notifications/me/7/read').flush({ success: true });
    await result;
    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });
});
