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
        this._participationRevision = signal(0, ...(ngDevMode ? [{ debugName: "_participationRevision" }] : []));
        this.incoming = this._incoming.asReadonly();
        this.outgoing = this._outgoing.asReadonly();
        this.participationRevision = this._participationRevision.asReadonly();
    }
    async refreshRequests() {
        await this.loadRequests();
    }
    clearState() {
        this._incoming.set([]);
        this._outgoing.set([]);
    }
    async createOpportunityRequest(investment, ..._args) {
        const opportunityId = investment.opportunityId ?? investment.id;
        if (!opportunityId) {
            throw new Error('Opportunity is not available.');
        }
        await firstValueFrom(this.http.post(`${this.apiBase}/api/v1/opportunities/${encodeURIComponent(String(opportunityId))}/conversations`, {}, this.authService.getAuthorizedJsonOptions()));
        await this.loadRequests();
    }
    async acceptRequest(request) {
        let acceptedConversationId;
        if (request.requestType === OpportunityRequestKind.Conversation) {
            const raw = await this.postConversationRequestAction(request.id, 'accept');
            const data = raw?.data ?? raw;
            acceptedConversationId = data?.acceptedConversationId;
        }
        else {
            await firstValueFrom(this.http.post(`${this.apiBase}/api/v1/opportunity-join-requests/${request.id}/approve`, {}, this.authService.getAuthorizedJsonOptions()));
            this._participationRevision.update(value => value + 1);
        }
        await this.loadRequests();
        this.notifications.showToast({
            title: request.requestType === OpportunityRequestKind.Conversation
                ? this.t('requests.notifications.chatAccepted')
                : this.t('requests.notifications.participationApproved'),
            message: this.interpolate(this.t('requests.notifications.acceptedMessage'), { projectName: request.projectName }),
            type: 'success'
        });
        return acceptedConversationId;
    }
    async declineRequest(request) {
        if (request.requestType === OpportunityRequestKind.Conversation) {
            await this.postConversationRequestAction(request.id, 'reject');
        }
        else {
            await firstValueFrom(this.http.post(`${this.apiBase}/api/v1/opportunity-join-requests/${request.id}/reject`, { reason: 'Declined from Client Portal' }, this.authService.getAuthorizedJsonOptions()));
        }
        await this.loadRequests();
        this.notifications.showToast({
            title: request.requestType === OpportunityRequestKind.Conversation
                ? this.t('requests.notifications.chatDeclined')
                : this.t('requests.notifications.participationRejected'),
            message: this.interpolate(this.t('requests.notifications.declinedMessage'), { projectName: request.projectName }),
            type: 'warning'
        });
    }
    async withdrawRequest(request) {
        if (request.requestType === OpportunityRequestKind.Conversation) {
            await this.postConversationRequestAction(request.id, 'withdraw');
        }
        else {
            await firstValueFrom(this.http.post(`${this.apiBase}/api/v1/opportunity-join-requests/${request.id}/cancel`, {}, this.authService.getAuthorizedJsonOptions()));
        }
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
            const activeContext = this.roleContext.activeContext();
            const canLoadFounderParticipation = activeContext === 'founder' && this.roleContext.isFounderUser();
            const canLoadInvestorParticipation = activeContext === 'investor' && this.roleContext.isInvestorUser();
            const [conversationRequestRaw, founderIncomingJoinRaw, investorOutgoingJoinRaw] = await Promise.all([
                firstValueFrom(this.http.get(`${this.apiBase}/api/v1/conversation-requests`, this.authService.getAuthorizedJsonOptions())),
                canLoadFounderParticipation
                    ? firstValueFrom(this.http.get(`${this.apiBase}/api/v1/opportunities/incoming-join-requests`, this.authService.getAuthorizedJsonOptions()))
                    : Promise.resolve([]),
                canLoadInvestorParticipation
                    ? firstValueFrom(this.http.get(`${this.apiBase}/api/v1/opportunities/my-join-requests`, this.authService.getAuthorizedJsonOptions()))
                    : Promise.resolve([])
            ]);
            const conversationRequests = this.extractArray(conversationRequestRaw).map(row => this.mapConversationRequest(row));
            const founderIncomingJoinRequests = this.extractArray(founderIncomingJoinRaw).map(row => this.mapJoinRequest(row, 'incoming'));
            const investorOutgoingJoinRequests = this.extractArray(investorOutgoingJoinRaw).map(row => this.mapJoinRequest(row, 'outgoing'));
            const joinRequests = [...founderIncomingJoinRequests, ...investorOutgoingJoinRequests];
            const all = [...conversationRequests, ...joinRequests].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
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
    mapJoinRequest(data, directionFallback) {
        const terms = this.parseTermsSnapshot(data.termsSnapshotJson);
        const loanTerms = this.toLoanTermsSnapshot(terms);
        const profitSharingTerms = this.toProfitSharingTermsSnapshot(terms);
        const investmentModel = data.investmentModel ?? terms.InvestmentModel ?? terms.investmentModel ?? null;
        return {
            id: data.id ?? data.requestId,
            type: 'participation',
            direction: this.normalizeDirection(data.direction, directionFallback),
            projectName: data.opportunityTitle || this.t('requests.fallbacks.opportunity'),
            projectImageUrl: '',
            counterpartName: data.counterpartyFullName || data.counterpartyName || data.investorDisplayName || data.investorFullName || data.investorName || data.founderFullName || data.founderName || this.t('requests.fallbacks.participant'),
            senderName: data.requesterFullName || data.requesterName || data.investorDisplayName || data.investorFullName || data.investorName,
            receiverName: data.recipientFullName || data.recipientName || data.founderFullName || data.founderName,
            status: this.normalizeStatus(data.status),
            createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
            requestedAmount: data.requestedAmount ?? data.calculatedTotalAmount ?? terms.TotalInvestmentAmount ?? terms.CalculatedTotalAmount ?? loanTerms?.requestedAmount ?? loanTerms?.contributionAmount ?? profitSharingTerms?.requestedAmount ?? profitSharingTerms?.contributionAmount,
            shares: data.numberOfShares ?? data.shares ?? terms.SelectedShares,
            sharePriceSnapshot: data.sharePriceSnapshot ?? terms.SharePriceSnapshot,
            calculatedTotalAmount: data.calculatedTotalAmount ?? data.totalAmount ?? terms.CalculatedTotalAmount ?? terms.TotalInvestmentAmount ?? loanTerms?.expectedTotalRepaymentAmount ?? profitSharingTerms?.calculatedTotalAmount,
            currencySnapshot: data.currency ?? terms.CurrencySnapshot ?? loanTerms?.currencySnapshot ?? profitSharingTerms?.currencySnapshot,
            opportunityId: this.toNumber(data.opportunityId),
            investorId: data.investorId,
            founderId: data.founderId,
            requestType: OpportunityRequestKind.Participation,
            investmentModel: investmentModel ? String(investmentModel) : null,
            loanTermsSnapshot: loanTerms,
            profitSharingTermsSnapshot: profitSharingTerms,
            acceptedConversationId: data.acceptedConversationId ?? data.sourceConversationId ?? null,
            canAccept: data.canApprove,
            canReject: data.canReject,
            requestMetadata: { ...data, termsSnapshot: terms }
        };
    }
    parseTermsSnapshot(value) {
        if (!value || typeof value !== 'string')
            return {};
        try {
            const parsed = JSON.parse(value);
            return parsed && typeof parsed === 'object' ? parsed : {};
        }
        catch {
            return {};
        }
    }
    toLoanTermsSnapshot(terms) {
        const model = terms.InvestmentModel ?? terms.investmentModel;
        const modelKey = String(model ?? '').toLowerCase().replace(/[\s_-]+/g, '');
        const hasLoanShape = modelKey === 'loaninvestment' || modelKey === 'loan' || modelKey === '3' || terms.ContributionAmount !== undefined || terms.ReturnRateSnapshot !== undefined;
        if (!hasLoanShape)
            return null;
        return {
            investmentModel: model ? String(model) : 'LoanInvestment',
            contributionAmount: this.toNullableNumber(terms.ContributionAmount),
            requestedAmount: this.toNullableNumber(terms.RequestedAmount),
            currencySnapshot: terms.CurrencySnapshot ?? null,
            returnRateSnapshot: this.toNullableNumber(terms.ReturnRateSnapshot),
            returnRateTypeSnapshot: terms.ReturnRateTypeSnapshot ?? null,
            termValueSnapshot: this.toNullableNumber(terms.TermValueSnapshot),
            termUnitSnapshot: terms.TermUnitSnapshot ?? null,
            repaymentModelSnapshot: terms.RepaymentModelSnapshot ?? null,
            expectedReturnAmount: this.toNullableNumber(terms.ExpectedReturnAmount),
            expectedTotalRepaymentAmount: this.toNullableNumber(terms.ExpectedTotalRepaymentAmount),
            calculatedTotalAmount: this.toNullableNumber(terms.CalculatedTotalAmount)
        };
    }
    toProfitSharingTermsSnapshot(terms) {
        const model = terms.InvestmentModel ?? terms.investmentModel;
        const modelKey = String(model ?? '').toLowerCase().replace(/[\s_-]+/g, '');
        const hasProfitSharingShape = modelKey === 'capitalcontributionprofitsharing'
            || modelKey === 'profitsharing'
            || modelKey === 'profitshare'
            || modelKey === '2'
            || terms.ProposedSharePercentage !== undefined
            || terms.proposedSharePercentage !== undefined
            || terms.ProfitSharePercentageSnapshot !== undefined
            || terms.profitSharePercentage !== undefined;
        if (!hasProfitSharingShape)
            return null;
        return {
            investmentModel: model ? String(model) : 'CapitalContributionProfitSharing',
            contributionAmount: this.toNullableNumber(terms.ContributionAmount ?? terms.contributionAmount ?? terms.RequestedAmount ?? terms.requestedAmount),
            requestedAmount: this.toNullableNumber(terms.RequestedAmount ?? terms.requestedAmount),
            currencySnapshot: terms.CurrencySnapshot ?? terms.currencySnapshot ?? null,
            profitSharePercentageSnapshot: this.toNullableNumber(terms.ProfitSharePercentage ?? terms.profitSharePercentage ?? terms.ProfitSharePercentageSnapshot ?? terms.profitSharePercentageSnapshot ?? terms.ProfitSharingPercentageSnapshot),
            proposedSharePercentage: this.toNullableNumber(terms.ProposedSharePercentage ?? terms.proposedSharePercentage),
            expectedProfitAmount: this.toNullableNumber(terms.ExpectedProfitAmount ?? terms.expectedProfitAmount),
            expectedTotalPayoutAmount: this.toNullableNumber(terms.ExpectedTotalPayoutAmount ?? terms.expectedTotalPayoutAmount),
            opportunityTotalExpectedPayout: this.toNullableNumber(terms.OpportunityTotalExpectedPayout ?? terms.opportunityTotalExpectedPayout),
            termValueSnapshot: this.toNullableNumber(terms.TermValueSnapshot ?? terms.termValueSnapshot ?? terms.termValue),
            termUnitSnapshot: terms.TermUnitSnapshot ?? terms.termUnitSnapshot ?? terms.termUnit ?? null,
            expectedDurationMonthsSnapshot: this.toNullableNumber(terms.ExpectedDurationMonthsSnapshot ?? terms.expectedDurationMonthsSnapshot ?? terms.expectedDurationMonths),
            exitTermsSnapshot: terms.ExitTerms ?? terms.exitTerms ?? terms.ExitTermsSnapshot ?? terms.exitTermsSnapshot ?? null,
            contractStartDate: terms.ContractStartDate ?? terms.contractStartDate ?? null,
            contractEndDate: terms.ContractEndDate ?? terms.contractEndDate ?? null,
            calculatedTotalAmount: this.toNullableNumber(terms.CalculatedTotalAmount ?? terms.calculatedTotalAmount)
        };
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
