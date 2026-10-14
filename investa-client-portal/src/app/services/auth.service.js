import { Injectable, signal, Inject } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_BASE } from '../config/api.token';
import * as i0 from "@angular/core";
import * as i1 from "@angular/common/http";
import * as i2 from "./notification.service";
import * as i3 from "./firebase-client.service";
import * as i4 from "./notification-refresh-coordinator.service";
import * as i5 from "./fcm.service";
export class AuthService {
    constructor(http, apiBase, notificationService, firebaseClient, coordinator, fcmService) {
        this.http = http;
        this.apiBase = apiBase;
        this.notificationService = notificationService;
        this.firebaseClient = firebaseClient;
        this.coordinator = coordinator;
        this.fcmService = fcmService;
        this.isAuthenticated = signal(false, ...(ngDevMode ? [{ debugName: "isAuthenticated" }] : []));
        this.userRole = signal(null, ...(ngDevMode ? [{ debugName: "userRole" }] : []));
        this.initialized = false;
        this.notificationUserId = null;
        this.notificationConnectionVersion = 0;
    }
    async initialize() {
        if (this.initialized)
            return;
        const token = this.getAccessToken();
        const expiry = this.getTokenExpiry();
        if (!token) {
            this.isAuthenticated.set(false);
            this.userRole.set(null);
            this.initialized = true;
            return;
        }
        if (expiry && expiry < new Date()) {
            this.logout();
            this.initialized = true;
            return;
        }
        const role = localStorage.getItem('userRole');
        this.isAuthenticated.set(true);
        if (role) {
            this.userRole.set(role);
        }
        this.initialized = true;
    }
    async login(phoneNumber, password, role) {
        const url = `${this.apiBase}/api/v1/auth/login`;
        const payload = { phoneNumber, password };
        const resp = await firstValueFrom(this.http.post(url, payload));
        if (!resp || !resp.success || !resp.data) {
            throw new Error('Login failed');
        }
        const data = resp.data;
        localStorage.setItem('accessToken', data.token);
        if (data.refreshToken)
            localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('tokenExpiresAt', data.expiresAt);
        localStorage.setItem('phoneNumber', data.phoneNumber);
        if (role) {
            localStorage.setItem('userRole', role);
            this.userRole.set(role);
        }
        localStorage.setItem('isLoggedIn', 'true');
        this.isAuthenticated.set(true);
    }
    startNotificationLoading() {
        if (this.isAuthenticated() && this.getAccessToken()) {
            this.coordinator.start();
        }
    }
    async startNotificationSession(userId, reconnect = false) {
        if (!this.isAuthenticated() || !this.getAccessToken() || !userId)
            return;
        this.startNotificationLoading();
        if (!reconnect && this.notificationUserId === userId)
            return;
        this.notificationUserId = userId;
        const connectionVersion = ++this.notificationConnectionVersion;
        try {
            this.firebaseClient.initialize();
            await this.firebaseClient.connectForUser(userId);
        }
        catch {
            // API polling remains active when realtime is unavailable.
        }
        if (connectionVersion !== this.notificationConnectionVersion) {
            this.firebaseClient.disconnect();
        }
    }
    logout() {
        this.notificationUserId = null;
        this.notificationConnectionVersion++;
        this.coordinator.stop();
        this.notificationService.clear();
        this.fcmService.disable();
        this.firebaseClient.disconnect();
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userRole');
        localStorage.removeItem('activeClientContext');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('tokenExpiresAt');
        localStorage.removeItem('phoneNumber');
        this.isAuthenticated.set(false);
        this.userRole.set(null);
    }
    getAccessToken() {
        return localStorage.getItem('accessToken');
    }
    getAuthorizationHeaderValue() {
        const token = this.getAccessToken();
        if (!token)
            return null;
        const normalized = token.replace(/^Bearer\s+/i, '').trim();
        return normalized ? `Bearer ${normalized}` : null;
    }
    getAuthorizedJsonOptions() {
        let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        const authorization = this.getAuthorizationHeaderValue();
        if (authorization) {
            headers = headers.set('Authorization', authorization);
        }
        return { headers };
    }
    getRefreshToken() {
        return localStorage.getItem('refreshToken');
    }
    getTokenExpiry() {
        const v = localStorage.getItem('tokenExpiresAt');
        if (!v)
            return null;
        const d = new Date(v);
        return isNaN(d.getTime()) ? null : d;
    }
    isTokenExpiringSoon(thresholdSeconds = 60) {
        const exp = this.getTokenExpiry();
        if (!exp)
            return false;
        const now = new Date();
        return (exp.getTime() - now.getTime()) / 1000 < thresholdSeconds;
    }
    async signupInit(phoneNumber, password, firstName, lastName, clientType = 'Investor') {
        const url = `${this.apiBase}/api/v1/auth/signup-init`;
        const payload = { phoneNumber, password, firstName, lastName, clientType };
        const resp = await firstValueFrom(this.http.post(url, payload));
        if (!resp || !resp.success || !resp.data) {
            throw new Error('Signup initiation failed');
        }
        return resp.data;
    }
    async signupVerify(verificationSessionId, otpCode) {
        const url = `${this.apiBase}/api/v1/auth/signup-verify`;
        const payload = { verificationSessionId, otpCode };
        const resp = await firstValueFrom(this.http.post(url, payload));
        if (!resp || !resp.success) {
            throw new Error('OTP verification failed');
        }
    }
    async refresh() {
        const refreshToken = this.getRefreshToken();
        if (!refreshToken) {
            this.logout();
            throw new Error('No refresh token available');
        }
        const url = `${this.apiBase}/api/v1/auth/refresh`;
        const resp = await firstValueFrom(this.http.post(url, { refreshToken }));
        if (!resp || !resp.success || !resp.data) {
            this.logout();
            throw new Error('Refresh failed');
        }
        const data = resp.data;
        localStorage.setItem('accessToken', data.token);
        if (data.refreshToken)
            localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('tokenExpiresAt', data.expiresAt);
        if (data.phoneNumber)
            localStorage.setItem('phoneNumber', data.phoneNumber);
        this.isAuthenticated.set(true);
        if (this.notificationUserId) {
            await this.startNotificationSession(this.notificationUserId, true);
        }
    }
    static { this.ɵfac = function AuthService_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || AuthService)(i0.ɵɵinject(i1.HttpClient), i0.ɵɵinject(API_BASE), i0.ɵɵinject(i2.NotificationService), i0.ɵɵinject(i3.FirebaseClientService), i0.ɵɵinject(i4.NotificationRefreshCoordinator), i0.ɵɵinject(i5.FcmService)); }; }
    static { this.ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: AuthService, factory: AuthService.ɵfac, providedIn: 'root' }); }
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(AuthService, [{
        type: Injectable,
        args: [{
                providedIn: 'root'
            }]
    }], () => [{ type: i1.HttpClient }, { type: undefined, decorators: [{
                type: Inject,
                args: [API_BASE]
            }] }, { type: i2.NotificationService }, { type: i3.FirebaseClientService }, { type: i4.NotificationRefreshCoordinator }, { type: i5.FcmService }], null); })();
