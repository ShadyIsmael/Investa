import { Injectable, signal, computed, Inject } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { TOAST_DURATION_MS } from '../config/constants';
import { API_BASE } from '../config/api.token';
import * as i0 from "@angular/core";
import * as i1 from "@angular/common/http";
/**
 * Service for managing in-app notifications and toast messages.
 * Notifications are fetched from the backend (GET /api/v1/user-notifications)
 * and polled every 30 seconds to stay up to date.
 */
export class NotificationService {
    constructor(http, apiBase, zone) {
        this.http = http;
        this.apiBase = apiBase;
        this.zone = zone;
        this.nextToastId = 1;
        this.pollTimer = null;
        this.POLL_INTERVAL_MS = 30_000;
        /** All notifications loaded from backend */
        this.notifications = signal([], ...(ngDevMode ? [{ debugName: "notifications" }] : []));
        /** Total count from last backend response (may exceed the loaded slice) */
        this.totalCount = signal(0, ...(ngDevMode ? [{ debugName: "totalCount" }] : []));
        /** Active toast messages */
        this.toasts = signal([], ...(ngDevMode ? [{ debugName: "toasts" }] : []));
        /** Count of unread notifications */
        this.unreadCount = computed(() => this.notifications().filter(n => !n.read).length, ...(ngDevMode ? [{ debugName: "unreadCount" }] : []));
    }
    // ── Backend fetch ─────────────────────────────────────────────────────────
    getHeaders() {
        const token = localStorage.getItem('accessToken');
        return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
    }
    /** Load (or reload) notifications from the backend. pageSize=10 for navbar. */
    async loadNotifications(pageSize = 10, page = 1) {
        try {
            const url = `${this.apiBase}/api/v1/user-notifications?page=${page}&pageSize=${pageSize}`;
            const resp = await firstValueFrom(this.http.get(url, { headers: this.getHeaders() }));
            const mapped = resp.items.map(n => this.mapBackend(n));
            this.zone.run(() => {
                if (page === 1) {
                    this.notifications.set(mapped);
                }
                else {
                    this.notifications.update(existing => [...existing, ...mapped]);
                }
                this.totalCount.set(resp.totalCount);
            });
        }
        catch {
            // Silently ignore – backend may not be running or user not authed
        }
    }
    /** Start background polling (call once after login) */
    startPolling() {
        this.stopPolling();
        this.loadNotifications();
        this.pollTimer = setInterval(() => this.loadNotifications(), this.POLL_INTERVAL_MS);
    }
    /** Stop background polling (call on logout) */
    stopPolling() {
        if (this.pollTimer !== null) {
            clearInterval(this.pollTimer);
            this.pollTimer = null;
        }
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
    }
    setNotifications(notifications) {
        this.notifications.set(notifications);
    }
    async markAsRead(id) {
        this.notifications.update(ns => ns.map(n => n.id === id ? { ...n, read: true } : n));
        try {
            await firstValueFrom(this.http.post(`${this.apiBase}/api/v1/user-notifications/mark-read`, { ids: [id] }, { headers: this.getHeaders() }));
        }
        catch { /* optimistic – ignore */ }
    }
    async markAllAsRead() {
        this.notifications.update(ns => ns.map(n => ({ ...n, read: true })));
        try {
            await firstValueFrom(this.http.post(`${this.apiBase}/api/v1/user-notifications/mark-read`, { ids: null }, { headers: this.getHeaders() }));
        }
        catch { /* optimistic – ignore */ }
    }
    async deleteNotification(id) {
        this.notifications.update(ns => ns.filter(n => n.id !== id));
        try {
            await firstValueFrom(this.http.delete(`${this.apiBase}/api/v1/user-notifications/${id}`, { headers: this.getHeaders() }));
        }
        catch { /* optimistic – ignore */ }
    }
    clear() {
        this.notifications.set([]);
        this.totalCount.set(0);
        this.stopPolling();
    }
    static { this.ɵfac = function NotificationService_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || NotificationService)(i0.ɵɵinject(i1.HttpClient), i0.ɵɵinject(API_BASE), i0.ɵɵinject(i0.NgZone)); }; }
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
            }] }, { type: i0.NgZone }], null); })();
