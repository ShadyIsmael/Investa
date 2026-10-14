import { Injectable, signal, Inject } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { TOAST_DURATION_MS } from '../config/constants';
import { API_BASE } from '../config/api.token';
import * as i0 from "@angular/core";
import * as i1 from "@angular/common/http";
import * as i2 from "@angular/router";
import * as i3 from "./client-notifications.service";
/**
 * Service for managing in-app notifications and toast messages.
 * Notifications are fetched from the backend (GET /api/v1/user-notifications).
 * Refresh orchestration is handled by NotificationRefreshCoordinator.
 */
export class NotificationService {
    constructor(http, apiBase, zone, router, clientNotifications) {
        this.http = http;
        this.apiBase = apiBase;
        this.zone = zone;
        this.router = router;
        this.clientNotifications = clientNotifications;
        this.nextToastId = 1;
        this.openingIds = new Set();
        /** All notifications loaded from backend */
        this.notifications = signal([], ...(ngDevMode ? [{ debugName: "notifications" }] : []));
        /** Total count from last backend response (may exceed the loaded slice) */
        this.totalCount = signal(0, ...(ngDevMode ? [{ debugName: "totalCount" }] : []));
        /** Active toast messages */
        this.toasts = signal([], ...(ngDevMode ? [{ debugName: "toasts" }] : []));
        /** Authoritative unread count returned by the backend. */
        this.unreadCount = signal(0, ...(ngDevMode ? [{ debugName: "unreadCount" }] : []));
        /** Unread chat/message notifications only. */
        this.unreadMessageCount = signal(0, ...(ngDevMode ? [{ debugName: "unreadMessageCount" }] : []));
    }
    // ── Backend fetch ─────────────────────────────────────────────────────────
    getHeaders() {
        const token = localStorage.getItem('accessToken');
        return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
    }
    /** Load (or reload) notifications from the backend. pageSize=10 for navbar. */
    async loadNotifications(pageSize = 10, page = 1) {
        try {
            const [items, backendUnreadCount, unreadMessageCount] = await Promise.all([
                this.clientNotifications.getNotifications(),
                this.clientNotifications.getUnreadCounts().catch(() => null),
                this.clientNotifications.getUnreadMessageCount().catch(() => null),
            ]);
            const start = (page - 1) * pageSize;
            const mapped = items.slice(start, start + pageSize).map(n => this.mapClient(n));
            this.zone.run(() => {
                if (page === 1) {
                    this.notifications.set(mapped);
                }
                else {
                    this.notifications.update(existing => [...existing, ...mapped]);
                }
                this.totalCount.set(items.length);
                this.unreadCount.set(backendUnreadCount?.notificationCount ?? items.filter(notification => !notification.isRead && !this.isChatAction(notification.actionUrl)).length);
                this.unreadMessageCount.set(unreadMessageCount ?? backendUnreadCount?.messageCount ?? 0);
            });
        }
        catch {
            // Silently ignore – coordinator handles retry
        }
    }
    /** Called by coordinator to apply backend data */
    setFromBackend(items, totalCount, unreadCount) {
        const mapped = items.map(n => this.mapBackend(n));
        this.notifications.set(mapped);
        this.totalCount.set(totalCount);
        this.unreadCount.set(mapped.filter(notification => !notification.read && !this.isChatAction(notification.actionUrl)).length);
        this.unreadMessageCount.set(mapped.filter(notification => !notification.read && this.isChatAction(notification.actionUrl)).length);
    }
    mapBackend(n) {
        return {
            id: n.id,
            title: n.title,
            message: n.body,
            timestamp: new Date(n.createdAt),
            read: n.isRead,
            type: n.type || 'info',
            actionUrl: n.actionUrl,
        };
    }
    mapClient(n) {
        return {
            id: Number(n.id),
            title: n.title,
            message: n.message,
            timestamp: new Date(n.createdAt),
            read: n.isRead,
            type: n.type || 'info',
            actionUrl: n.actionUrl,
        };
    }
    // ── Toasts ────────────────────────────────────────────────────────────────
    showToast(toastData) {
        const newToast = { ...toastData, id: this.nextToastId++ };
        this.toasts.update(current => [newToast, ...current]);
        setTimeout(() => this.removeToast(newToast.id), TOAST_DURATION_MS);
    }
    removeToast(id) {
        this.toasts.update(toasts => toasts.filter(t => t.id !== id));
    }
    // ── Mutation helpers ──────────────────────────────────────────────────────
    addNotification(notificationData) {
        const newNotification = {
            ...notificationData,
            id: Date.now(),
            timestamp: new Date(),
            read: false,
        };
        this.notifications.update(current => [newNotification, ...current]);
        this.totalCount.update(count => count + 1);
        this.unreadCount.update(count => count + 1);
        if (this.isChatAction(newNotification.actionUrl)) {
            this.unreadMessageCount.update(count => count + 1);
            this.unreadCount.update(count => Math.max(0, count - 1));
        }
    }
    setNotifications(notifications) {
        this.notifications.set(notifications);
        this.totalCount.set(notifications.length);
        this.unreadCount.set(notifications.filter(notification => !notification.read && !this.isChatAction(notification.actionUrl)).length);
        this.unreadMessageCount.set(notifications.filter(notification => !notification.read && this.isChatAction(notification.actionUrl)).length);
    }
    async markAsRead(id) {
        const notification = this.notifications().find(n => n.id === id);
        if (!notification || notification.read)
            return;
        this.notifications.update(ns => ns.map(n => n.id === id ? { ...n, read: true } : n));
        if (this.isChatAction(notification.actionUrl))
            this.unreadMessageCount.update(count => Math.max(0, count - 1));
        else
            this.unreadCount.update(count => Math.max(0, count - 1));
        try {
            await this.clientNotifications.markAsRead(id);
        }
        catch (error) {
            console.warn('[NotificationService] Failed to mark notification as read.', error);
        }
    }
    isOpening(id) {
        return this.openingIds.has(id);
    }
    async openNotification(notification) {
        if (this.openingIds.has(notification.id))
            return;
        this.openingIds.add(notification.id);
        try {
            if (!notification.read) {
                await this.markAsRead(notification.id);
            }
            await this.router.navigateByUrl(this.resolveTargetUrl(notification.actionUrl));
        }
        finally {
            this.openingIds.delete(notification.id);
        }
    }
    resolveTargetUrl(actionUrl) {
        const fallback = '/admin/notifications';
        if (!actionUrl)
            return fallback;
        const value = actionUrl.trim();
        if (!value.startsWith('/admin/') || value.includes('\\') || value.startsWith('//')) {
            return fallback;
        }
        const path = value.split(/[?#]/, 1)[0];
        const allowed = [
            /^\/admin\/notifications$/,
            /^\/admin\/requests$/,
            /^\/admin\/chat$/,
            /^\/admin\/investments\/\d+(?:\/requests)?$/,
            /^\/admin\/opportunities\/\d+(?:\/room)?$/,
            /^\/admin\/my-projects$/
        ];
        return allowed.some(pattern => pattern.test(path)) ? value : fallback;
    }
    async markAllAsRead() {
        this.notifications.update(ns => ns.map(n => ({ ...n, read: true })));
        this.unreadCount.set(0);
        this.unreadMessageCount.set(0);
        try {
            await this.clientNotifications.markAllAsRead();
        }
        catch { /* optimistic – ignore */ }
    }
    async deleteNotification(id) {
        const deleted = this.notifications().find(notification => notification.id === id);
        this.notifications.update(ns => ns.filter(n => n.id !== id));
        if (deleted) {
            this.totalCount.update(count => Math.max(0, count - 1));
            if (!deleted.read) {
                if (this.isChatAction(deleted.actionUrl))
                    this.unreadMessageCount.update(count => Math.max(0, count - 1));
                else
                    this.unreadCount.update(count => Math.max(0, count - 1));
            }
        }
        try {
            await firstValueFrom(this.http.delete(`${this.apiBase}/api/v1/user-notifications/${id}`, { headers: this.getHeaders() }));
        }
        catch { /* optimistic – ignore */ }
    }
    clear() {
        this.notifications.set([]);
        this.totalCount.set(0);
        this.unreadCount.set(0);
        this.unreadMessageCount.set(0);
    }
    isChatAction(actionUrl) {
        return !!actionUrl?.trim().startsWith('/admin/chat');
    }
    static { this.ɵfac = function NotificationService_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || NotificationService)(i0.ɵɵinject(i1.HttpClient), i0.ɵɵinject(API_BASE), i0.ɵɵinject(i0.NgZone), i0.ɵɵinject(i2.Router), i0.ɵɵinject(i3.ClientNotificationsService)); }; }
    static { this.ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: NotificationService, factory: NotificationService.ɵfac, providedIn: 'root' }); }
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(NotificationService, [{
        type: Injectable,
        args: [{
                providedIn: 'root'
            }]
    }], () => [{ type: i1.HttpClient }, { type: undefined, decorators: [{
                type: Inject,
                args: [API_BASE]
            }] }, { type: i0.NgZone }, { type: i2.Router }, { type: i3.ClientNotificationsService }], null); })();
