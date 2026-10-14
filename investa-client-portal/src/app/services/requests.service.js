import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_BASE } from '../config/api.token';
import { OpportunityRequestKind } from '../models/request.model';
import { NotificationService } from './notification.service';
import { AuthService } from './auth.service';
import { RoleContextService } from './role-context.service';
import { LanguageService } from './language.service';
import * as i0 from "@angular/core";
export class RequestsService {
    constructor() {
        this.http = inject(HttpClient);
        this.notifications = inject(NotificationService);
        this.authService = inject(AuthService);
        this.roleContext = inject(RoleContextService);
        this.languageService = inject(LanguageService);
        this.apiBase = inject(API_BASE);
        this._incoming = signal([], ...(ngDevMode ? [{ debugName: "_incoming" }] : []));
        this._outgoing = signal([], ...(ngDevMode ? [{ debugName: "_outgoing" }] : []));
        this.incoming = this._incoming.asReadonly();
        this.outgoing = this._outgoing.asReadonly();
    }
    async refreshRequests() {
        await this.loadRequests();
    }
    clearState() {
        this._incoming.set([]);
        this._outgoing.set([]);
    }
    async acceptRequest(request) {
        const raw = await this.postConversationRequestAction(request.id, 'accept');
        const data = raw?.data ?? raw;
        const acceptedConversationId = data?.acceptedConversationId;
        await this.loadRequests();
        this.notifications.showToast({
            title: this.t('requests.notifications.chatAccepted'),
            message: this.interpolate(this.t('requests.notifications.acceptedMessage'), { projectName: request.projectName }),
            type: 'success'
        });
        return acceptedConversationId;
    }
    async declineRequest(request) {
        await this.postConversationRequestAction(request.id, 'reject');
        await this.loadRequests();
        this.notifications.showToast({
            title: this.t('requests.notifications.chatDeclined'),
            message: this.interpolate(this.t('requests.notifications.declinedMessage'), { projectName: request.projectName }),
            type: 'warning'
        });
    }
    async withdrawRequest(request) {
        await this.postConversationRequestAction(request.id, 'withdraw');
        await this.loadRequests();
        this.notifications.showToast({
            title: this.t('requests.notifications.withdrawn'),
            message: this.interpolate(this.t('requests.notifications.withdrawnMessage'), { projectName: request.projectName }),
            type: 'success'
        });
    }
    async loadRequests() {
        try {
            try {
                await this.roleContext.ensureProfileLoaded();
            }
            catch (profileError) {
                console.warn('Unable to refresh role context before loading requests:', profileError);
            }
            const conversationRequestRaw = await firstValueFrom(this.http.get(`${this.apiBase}/api/v1/conversation-requests`, this.authService.getAuthorizedJsonOptions()));
            const conversationRequests = this.extractArray(conversationRequestRaw).map(row => this.mapConversationRequest(row));
            await this.hydrateConversationCounterpartyNames(conversationRequests);
            const all = conversationRequests.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
            this._incoming.set(all.filter(request => request.direction === 'incoming'));
            this._outgoing.set(all.filter(request => request.direction === 'outgoing'));
        }
        catch (error) {
            console.error('Failed to load opportunity requests:', error);
            this._incoming.set([]);
            this._outgoing.set([]);
        }
    }
    mapConversationRequest(data) {
        const opportunity = data.opportunity || {};
        return {
            id: data.id ?? data.conversationRequestId ?? data.requestId,
            type: 'conversation',
            direction: this.normalizeDirection(data.direction),
            projectName: data.opportunityTitle || data.title || opportunity.title || 'Opportunity',
            projectImageUrl: '',
            counterpartName: data.counterpartyFullName || data.counterpartyName || data.investorFullName || data.founderFullName || 'Participant',
            senderName: data.requesterFullName || data.requesterName || data.investorFullName,
            receiverName: data.recipientFullName || data.recipientName || data.founderFullName,
            businessName: data.businessName || opportunity.businessName,
            shortDescription: data.message || data.shortDescription || opportunity.shortDescription,
            status: this.normalizeConversationRequestStatus(data.status ?? data.requestStatus ?? data.statusText),
            createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
            opportunityId: this.toNumber(data.opportunityId ?? opportunity.id),
            investorId: data.requesterUserId,
            founderId: data.recipientUserId,
            requestType: OpportunityRequestKind.Conversation,
            acceptedConversationId: data.acceptedConversationId ?? null,
            canAccept: !!data.canAccept,
            canReject: !!data.canReject,
            canWithdraw: !!data.canWithdraw,
            requestMetadata: data
        };
    }
    async hydrateConversationCounterpartyNames(requests) {
        await Promise.all(requests.map(async (request) => {
            const currentName = request.direction === 'incoming' ? request.senderName : request.receiverName;
            const fallback = request.direction === 'incoming'
                ? this.t('requests.fallbacks.investor')
                : this.t('requests.fallbacks.founder');
            if (this.isRealCounterpartyName(currentName, fallback)) {
                request.counterpartName = currentName.trim();
                return;
            }
            const counterpartyId = request.direction === 'incoming' ? request.investorId : request.founderId;
            const resolvedName = await this.loadPublicUserName(counterpartyId);
            if (!resolvedName)
                return;
            request.counterpartName = resolvedName;
            if (request.direction === 'incoming')
                request.senderName = resolvedName;
            else
                request.receiverName = resolvedName;
        }));
    }
    async loadPublicUserName(userId) {
        if (!userId)
            return null;
        try {
            const raw = await firstValueFrom(this.http.get(`${this.apiBase}/api/profile/${encodeURIComponent(String(userId))}/public`, this.authService.getAuthorizedJsonOptions()));
            const profile = raw?.data ?? raw;
            return this.firstNonEmpty(profile?.displayName, profile?.fullName, this.joinName(profile?.firstName, profile?.lastName));
        }
        catch {
            return null;
        }
    }
    isRealCounterpartyName(value, translatedFallback) {
        const normalized = String(value ?? '').trim().toLowerCase();
        if (!normalized)
            return false;
        return ![
            'participant',
            'investor',
            'founder',
            'مشارك',
            'المشارك',
            'المستثمر',
            'المؤسس',
            translatedFallback.trim().toLowerCase()
        ].includes(normalized);
    }
    joinName(firstName, lastName) {
        return [firstName, lastName].map(value => String(value ?? '').trim()).filter(Boolean).join(' ');
    }
    firstNonEmpty(...values) {
        for (const value of values) {
            const text = String(value ?? '').trim();
            if (text && this.isRealCounterpartyName(text, ''))
                return text;
        }
        return null;
    }
    normalizeStatus(value) {
        const raw = String(value || 'Pending').toLowerCase();
        if (raw === '0')
            return 'Pending';
        if (raw === '1' || raw.includes('accepted') || raw.includes('approved'))
            return 'Accepted';
        if (raw.includes('partner'))
            return 'Partner';
        if (raw === '2' || raw.includes('reject'))
            return 'Rejected';
        if (raw.includes('declin'))
            return 'Declined';
        if (raw.includes('withdraw'))
            return 'Withdrawn';
        if (raw === '3' || raw.includes('cancel'))
            return 'Cancelled';
        if (raw.includes('clos'))
            return 'Closed';
        if (raw.includes('negotiat') || raw.includes('progress'))
            return 'Negotiating';
        return 'Pending';
    }
    normalizeConversationRequestStatus(value) {
        const raw = String(value ?? '').toLowerCase().replace(/[\s_-]+/g, '');
        switch (raw) {
            case '0':
            case 'pending':
                return 'Pending';
            case '1':
            case 'accepted':
                return 'Accepted';
            case '2':
            case 'rejected':
                return 'Rejected';
            case '3':
            case 'withdrawn':
                return 'Withdrawn';
            default:
                return this.normalizeStatus(value);
        }
    }
    async postConversationRequestAction(id, action) {
        return firstValueFrom(this.http.post(`${this.apiBase}/api/v1/conversation-requests/${encodeURIComponent(String(id))}/${action}`, {}, this.authService.getAuthorizedJsonOptions()));
    }
    extractArray(raw) {
        const data = raw?.data ?? raw;
        if (Array.isArray(data))
            return data;
        if (Array.isArray(data?.items))
            return data.items;
        if (Array.isArray(data?.conversations))
            return data.conversations;
        if (Array.isArray(data?.requests))
            return data.requests;
        return [];
    }
    normalizeDirection(value, fallback = 'outgoing') {
        const raw = String(value || '').toLowerCase();
        if (raw.includes('incoming'))
            return 'incoming';
        if (raw.includes('outgoing'))
            return 'outgoing';
        return fallback;
    }
    toNumber(value) {
        const parsed = Number(value);
        return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
    }
    toNullableNumber(value) {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : null;
    }
    t(path) {
        return this.languageService.translate(path);
    }
    interpolate(template, values) {
        return Object.entries(values).reduce((text, [key, value]) => text.replaceAll(`{${key}}`, String(value)), template);
    }
    static { this.ɵfac = function RequestsService_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || RequestsService)(); }; }
    static { this.ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: RequestsService, factory: RequestsService.ɵfac, providedIn: 'root' }); }
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(RequestsService, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], () => [], null); })();
