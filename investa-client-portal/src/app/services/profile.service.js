import { Injectable, Inject, signal } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_BASE } from '../config/api.token';
import * as i0 from "@angular/core";
import * as i1 from "@angular/common/http";
export class ProfileService {
    constructor(http, apiBase) {
        this.http = http;
        this.apiBase = apiBase;
        this._profile = signal(null, ...(ngDevMode ? [{ debugName: "_profile" }] : []));
        this.profile = this._profile.asReadonly();
    }
    async getPublicProfile(userId) {
        try {
            const url = `${this.apiBase}/api/profile/${encodeURIComponent(userId)}/public`;
            const token = this.getAccessTokenFromLocalStorage();
            const options = token ? { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) } : undefined;
            const raw = await firstValueFrom(this.http.get(url, options));
            return this.extractData(raw);
        }
        catch {
            return null;
        }
    }
    async loadMyProfile() {
        try {
            const url = `${this.apiBase}/api/profile/me`;
            console.debug('[ProfileService] loadMyProfile: GET', url);
            const token = this.getAccessTokenFromLocalStorage();
            const options = token ? { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) } : undefined;
            const raw = await firstValueFrom(this.http.get(url, options));
            const resp = this.extractData(raw);
            console.debug('[ProfileService] loadMyProfile: response', resp || raw);
            if (resp) {
                // Compute KYC completion percentage client-side if backend doesn't provide it
                try {
                    const pct = this.computeKycCompletion(resp);
                    if (!resp.basicInfo)
                        resp.basicInfo = {};
                    resp.basicInfo.kycCompletionPercentage = pct;
                }
                catch (e) {
                    // ignore compute errors
                }
                this._profile.set(resp);
                return resp;
            }
            this._profile.set(null);
            return null;
        }
        catch (err) {
            this._profile.set(null);
            throw err;
        }
    }
    async startKyc() {
        try {
            const url = `${this.apiBase}/api/profile/me/kyc/start`;
            console.debug('[ProfileService] startKyc: POST', url);
            const token = this.getAccessTokenFromLocalStorage();
            const options = token ? { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) } : undefined;
            const raw = await firstValueFrom(this.http.post(url, {}, options));
            const resp = this.extractData(raw);
            console.debug('[ProfileService] startKyc: response', resp || raw);
            if (resp) {
                try {
                    const pct = this.computeKycCompletion(resp);
                    if (!resp.basicInfo)
                        resp.basicInfo = {};
                    resp.basicInfo.kycCompletionPercentage = pct;
                }
                catch { }
                this._profile.set(resp);
                return resp;
            }
            return null;
        }
        catch (err) {
            throw err;
        }
    }
    async sendPasswordChangeOtp(currentPassword) {
        try {
            const url = `${this.apiBase}/api/v1/auth/change-password/send-otp`;
            const payload = { currentPassword };
            console.debug('[ProfileService] sendPasswordChangeOtp: POST', url, payload);
            const token = this.getAccessTokenFromLocalStorage();
            const options = token ? { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) } : undefined;
            const raw = await firstValueFrom(this.http.post(url, payload, options));
            const envelope = this.asEnvelope(raw);
            if (envelope?.success === false) {
                throw new Error(envelope.message || 'OTP request failed');
            }
        }
        catch (err) {
            console.error('[ProfileService] sendPasswordChangeOtp failed', err);
            throw err;
        }
    }
    async confirmPasswordChange(otpToken, newPassword) {
        try {
            const url = `${this.apiBase}/api/v1/auth/change-password/confirm`;
            const payload = { token: otpToken, newPassword };
            console.debug('[ProfileService] confirmPasswordChange: POST', url, payload);
            const token = this.getAccessTokenFromLocalStorage();
            const options = token ? { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) } : undefined;
            const raw = await firstValueFrom(this.http.post(url, payload, options));
            const envelope = this.asEnvelope(raw);
            if (envelope?.success === false) {
                throw new Error(envelope.message || 'Password change failed');
            }
        }
        catch (err) {
            console.error('[ProfileService] confirmPasswordChange failed', err);
            throw err;
        }
    }
    async updateMyProfile(profile) {
        try {
            const url = `${this.apiBase}/api/profile/me`;
            const payload = {
                basicInfo: {
                    fullName: profile.basicInfo?.fullName ?? null,
                    firstName: profile.basicInfo?.firstName ?? null,
                    birthDate: profile.basicInfo?.birthDate ?? null,
                    dateOfBirth: profile.basicInfo?.dateOfBirth ?? profile.basicInfo?.birthDate ?? null,
                    lastName: profile.basicInfo?.lastName ?? null,
                    gender: profile.basicInfo?.gender ?? null,
                    nationality: profile.basicInfo?.nationality ?? null,
                    country: profile.basicInfo?.country ?? null,
                    bio: profile.basicInfo?.bio ?? null,
                    avatarUrl: profile.basicInfo?.avatarUrl ?? null,
                    companyName: profile.basicInfo?.companyName ?? null,
                    jobTitle: profile.basicInfo?.jobTitle ?? null,
                    websiteUrl: profile.basicInfo?.websiteUrl ?? null,
                    linkedInUrl: profile.basicInfo?.linkedInUrl ?? null,
                    facebookUrl: profile.basicInfo?.facebookUrl ?? null
                },
                contactInfo: {
                    email: profile.contactInfo?.email ?? null,
                    phone1: profile.contactInfo?.phone1 ?? null,
                    phone2: profile.contactInfo?.phone2 ?? null,
                    workAddress: profile.contactInfo?.workAddress ?? null,
                    address: profile.contactInfo?.address ?? null,
                    city: profile.contactInfo?.city ?? null,
                    companyAddress: profile.contactInfo?.companyAddress ?? null,
                    companyEmail: profile.contactInfo?.companyEmail ?? null,
                    linkedInUrl: profile.contactInfo?.linkedInUrl ?? null,
                    facebookUrl: profile.contactInfo?.facebookUrl ?? null
                },
                identityCompliance: {
                    documentNumber: profile.identityCompliance?.documentNumber ?? null,
                    documentExpiryDate: profile.identityCompliance?.documentExpiryDate ?? null,
                    verificationStatus: profile.identityCompliance?.verificationStatus ?? null,
                    documentFrontImageUrl: profile.identityCompliance?.documentFrontImageUrl ?? null,
                    documentBackImageUrl: profile.identityCompliance?.documentBackImageUrl ?? null,
                    hrLetterFileName: profile.identityCompliance?.hrLetterFileName ?? null,
                    hrLetterBase64: profile.identityCompliance?.hrLetterBase64 ?? null,
                    deviceMacAddress: profile.identityCompliance?.deviceMacAddress ?? null
                }
            };
            console.debug('[ProfileService] updateMyProfile: PUT', url, 'payload:', payload);
            const cleanedPayload = this.removeNulls(payload);
            console.debug('[ProfileService] updateMyProfile: cleanedPayload:', cleanedPayload);
            const token = this.getAccessTokenFromLocalStorage();
            const options = token ? { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) } : undefined;
            const raw = await firstValueFrom(this.http.put(url, cleanedPayload, options));
            const envelope = this.asEnvelope(raw);
            if (envelope?.success === false) {
                console.error('[ProfileService] updateMyProfile: API returned success=false', raw);
                throw new Error(envelope.message || 'API returned an error');
            }
            const resp = this.extractData(raw);
            console.debug('[ProfileService] updateMyProfile: response', resp || raw);
            if (resp) {
                try {
                    const pct = this.computeKycCompletion(resp);
                    if (!resp.basicInfo)
                        resp.basicInfo = {};
                    resp.basicInfo.kycCompletionPercentage = pct;
                }
                catch { }
                this._profile.set(resp);
                return resp;
            }
            return null;
        }
        catch (err) {
            // Log detailed error info for debugging and include structured API error if present
            try {
                const errorRecord = this.asRecord(err);
                const apiErr = errorRecord?.['error'];
                console.error('Failed to update profile', {
                    message: errorRecord?.['message'],
                    status: errorRecord?.['status'],
                    apiMessage: apiErr?.message,
                    apiCode: apiErr?.code,
                    apiErrors: apiErr?.errors,
                    rawError: err
                });
            }
            catch (logErr) {
                console.error('Failed to update profile (logging failed)', logErr);
            }
            throw err;
        }
    }
    extractData(raw) {
        if (!raw)
            return null;
        const envelope = this.asEnvelope(raw);
        if (envelope && envelope.data !== undefined) {
            return envelope.data;
        }
        // Otherwise assume raw is the payload
        return raw;
    }
    removeNulls(obj) {
        if (obj === null || obj === undefined)
            return obj;
        if (Array.isArray(obj))
            return obj.map(v => this.removeNulls(v)).filter(v => v !== undefined && v !== null);
        if (typeof obj !== 'object')
            return obj;
        const record = obj;
        const out = {};
        Object.keys(record).forEach(key => {
            const val = record[key];
            if (val === null || val === undefined)
                return;
            const cleaned = this.removeNulls(val);
            if (cleaned === null || cleaned === undefined)
                return;
            out[key] = cleaned;
        });
        return out;
    }
    asEnvelope(value) {
        const record = this.asRecord(value);
        return record ? record : null;
    }
    asRecord(value) {
        return typeof value === 'object' && value !== null ? value : null;
    }
    /**
     * Compute a simple KYC completion percentage based on presence of key profile fields.
     * This is a client-side heuristic used when backend doesn't provide an explicit percentage.
     */
    computeKycCompletion(profile) {
        if (!profile)
            return 0;
        // New KYC rules (client-side heuristic): count these five fields equally:
        // - name (first and/or last or fullName)
        // - mobile (contactInfo.phone1)
        // - email (contactInfo.email)
        // - national ID (identityCompliance.documentNumber)
        // - ID images (documentFrontImageUrl or documentBackImageUrl)
        const checks = [
            // Name: either fullName or both/one of first/last
            () => !!(profile.basicInfo?.fullName || profile.basicInfo?.firstName || profile.basicInfo?.lastName),
            // Mobile
            () => !!(profile.contactInfo?.phone1 || profile.contactInfo?.phone2),
            // Email
            () => !!profile.contactInfo?.email,
            // National ID number
            () => !!profile.identityCompliance?.documentNumber,
            // ID images uploaded (front or back)
            () => !!(profile.identityCompliance?.documentFrontImageUrl || profile.identityCompliance?.documentBackImageUrl)
        ];
        const total = checks.length;
        let filled = 0;
        for (const fn of checks) {
            try {
                if (fn())
                    filled++;
            }
            catch { }
        }
        const pct = total === 0 ? 0 : Math.round((filled / total) * 100);
        return Math.min(100, Math.max(0, pct));
    }
    getAccessTokenFromLocalStorage() {
        try {
            return localStorage.getItem('accessToken');
        }
        catch {
            return null;
        }
    }
    clear() {
        this._profile.set(null);
    }
    static { this.ɵfac = function ProfileService_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || ProfileService)(i0.ɵɵinject(i1.HttpClient), i0.ɵɵinject(API_BASE)); }; }
    static { this.ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: ProfileService, factory: ProfileService.ɵfac, providedIn: 'root' }); }
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(ProfileService, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], () => [{ type: i1.HttpClient }, { type: undefined, decorators: [{
                type: Inject,
                args: [API_BASE]
            }] }], null); })();
