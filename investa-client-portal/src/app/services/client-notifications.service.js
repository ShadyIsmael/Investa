import { Inject, Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_BASE } from '../config/api.token';
import * as i0 from "@angular/core";
import * as i1 from "@angular/common/http";
import * as i2 from "./language.service";
export class ClientNotificationsService {
    constructor(http, apiBase, language) {
        this.http = http;
        this.apiBase = apiBase;
        this.language = language;
    }
    async getNotifications() {
        try {
            const raw = await firstValueFrom(this.http.get(`${this.apiBase}/api/v1/notifications/me`, { headers: this.authHeaders() }));
            const data = this.extractData(raw, 'Failed to load notifications.');
            const items = Array.isArray(data) ? data : data?.items ?? [];
            return items.map(item => this.mapNotification(item));
        }
        catch (error) {
            throw this.toNotificationError(error, 'Failed to load notifications.');
        }
    }
    async getUnreadCount() {
        return (await this.getUnreadCounts()).unreadCount;
    }
    async getUnreadCounts() {
        try {
            const raw = await firstValueFrom(this.http.get(`${this.apiBase}/api/v1/notifications/me/unread-count`, { headers: this.authHeaders() }));
            const data = this.extractData(raw, 'Failed to load unread notification count.');
            const total = typeof data === 'number' ? data : data?.unreadCount ?? data?.count ?? 0;
            return {
                unreadCount: total,
                notificationCount: typeof data === 'number' ? total : data?.notificationCount ?? total,
                messageCount: typeof data === 'number' ? 0 : data?.messageCount ?? 0
            };
        }
        catch (error) {
            throw this.toNotificationError(error, 'Failed to load unread notification count.');
        }
    }
    async getUnreadMessageCount() {
        const raw = await firstValueFrom(this.http.get(`${this.apiBase}/api/v1/conversations`, { headers: this.authHeaders() }));
        const conversations = this.extractData(raw, 'Failed to load unread message count.');
        return (Array.isArray(conversations) ? conversations : [])
            .reduce((total, conversation) => total + Math.max(0, Number(conversation.unreadCount) || 0), 0);
    }
    async markAsRead(id) {
        try {
            await firstValueFrom(this.http.patch(`${this.apiBase}/api/v1/notifications/me/${encodeURIComponent(String(id))}/read`, {}, { headers: this.authHeaders() }));
        }
        catch (error) {
            throw this.toNotificationError(error, 'Failed to mark notification as read.');
        }
    }
    async markAllAsRead() {
        try {
            await firstValueFrom(this.http.patch(`${this.apiBase}/api/v1/notifications/me/read-all`, {}, { headers: this.authHeaders() }));
        }
        catch (error) {
            throw this.toNotificationError(error, 'Failed to mark notifications as read.');
        }
    }
    mapNotification(notification) {
        return {
            id: notification.id,
            title: notification.title || 'Notification',
            message: notification.eventType === 'FundingDeclared'
                ? this.language.translate('notifications.fundingDeclared')
                : notification.message || notification.body || '',
            createdAt: notification.createdAt || notification.timestamp || '',
            isRead: notification.isRead ?? notification.read ?? false,
            type: notification.type || 'info',
            actionUrl: notification.actionUrl ?? null
        };
    }
    extractData(raw, fallbackMessage) {
        if (!raw) {
            throw new Error(fallbackMessage);
        }
        const wrapped = raw;
        if (wrapped.data !== undefined) {
            if (wrapped.success === false) {
                throw new Error(wrapped.message || fallbackMessage);
            }
            return wrapped.data;
        }
        return raw;
    }
    authHeaders() {
        const token = this.getAccessTokenFromLocalStorage();
        return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
    }
    getAccessTokenFromLocalStorage() {
        try {
            return localStorage.getItem('accessToken');
        }
        catch {
            return null;
        }
    }
    toNotificationError(error, fallbackMessage) {
        if (error?.status === 401) {
            return new Error('You must be signed in to view notifications.');
        }
        if (error?.status === 403) {
            return new Error('Your account is not allowed to view these notifications.');
        }
        const apiMessage = error?.error?.message || error?.message;
        return new Error(apiMessage || fallbackMessage);
    }
    static { this.ɵfac = function ClientNotificationsService_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || ClientNotificationsService)(i0.ɵɵinject(i1.HttpClient), i0.ɵɵinject(API_BASE), i0.ɵɵinject(i2.LanguageService)); }; }
    static { this.ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: ClientNotificationsService, factory: ClientNotificationsService.ɵfac, providedIn: 'root' }); }
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(ClientNotificationsService, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], () => [{ type: i1.HttpClient }, { type: undefined, decorators: [{
                type: Inject,
                args: [API_BASE]
            }] }, { type: i2.LanguageService }], null); })();
