import { Injectable, signal, Inject } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_BASE } from '../config/api.token';
import * as i0 from "@angular/core";
import * as i1 from "@angular/common/http";
import * as i2 from "./notification.service";
export class AuthService {
    constructor(http, apiBase, notificationService) {
        this.http = http;
        this.apiBase = apiBase;
        this.notificationService = notificationService;
        this.isAuthenticated = signal(false, ...(ngDevMode ? [{ debugName: "isAuthenticated" }] : []));
        this.userRole = signal(null, ...(ngDevMode ? [{ debugName: "userRole" }] : []));
        this.initialized = false;
    }
    /**
     * Initialize authentication state on application startup
     * Validates token and restores session if valid
     */
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
        // Check if token is expired
        if (expiry && expiry < new Date()) {
            // Token expired, clear auth state
            this.logout();
            this.initialized = true;
            return;
        }
        // Token exists and is not expired, restore session
        const role = localStorage.getItem('userRole');
        this.isAuthenticated.set(true);
        if (role) {
            this.userRole.set(role);
        }
        this.notificationService.startPolling();
        this.initialized = true;
    }
    /**
     * Call backend login API and persist returned tokens
     */
    async login(phoneNumber, password, role) {
        const url = `${this.apiBase}/api/v1/auth/login`;
        const payload = { phoneNumber, password };
        const resp = await firstValueFrom(this.http.post(url, payload));
        if (!resp || !resp.success || !resp.data) {
            throw new Error(resp?.message || 'Login failed');
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
        this.notificationService.startPolling();
    }
    logout() {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userRole');
        localStorage.removeItem('activeClientContext');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('tokenExpiresAt');
        localStorage.removeItem('phoneNumber');
        this.isAuthenticated.set(false);
        this.userRole.set(null);
        this.notificationService.clear();
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
            throw new Error(resp?.message || 'Refresh failed');
        }
        const data = resp.data;
        localStorage.setItem('accessToken', data.token);
        if (data.refreshToken)
            localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('tokenExpiresAt', data.expiresAt);
        if (data.phoneNumber)
            localStorage.setItem('phoneNumber', data.phoneNumber);
        this.isAuthenticated.set(true);
    }
    static { this.ɵfac = function AuthService_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || AuthService)(i0.ɵɵinject(i1.HttpClient), i0.ɵɵinject(API_BASE), i0.ɵɵinject(i2.NotificationService)); }; }
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
            }] }, { type: i2.NotificationService }], null); })();
