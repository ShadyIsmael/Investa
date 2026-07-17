import { computed, Injectable, inject, signal } from '@angular/core';
import { AuthService } from './auth.service';
import { ProfileService } from './profile.service';
import * as i0 from "@angular/core";
export class RoleContextService {
    constructor() {
        this.authService = inject(AuthService);
        this.profileService = inject(ProfileService);
        this.selectedContext = signal(this.readStoredContext(), ...(ngDevMode ? [{ debugName: "selectedContext" }] : []));
        this.clientType = computed(() => {
            const profileClientType = this.profileService.profile()?.coreMetrics?.clientType;
            return this.hasKnownCapability(profileClientType)
                ? profileClientType
                : this.authService.userRole() || profileClientType || '';
        }, ...(ngDevMode ? [{ debugName: "clientType" }] : []));
        this.isFounderUser = computed(() => this.matchesFounder(this.clientType()), ...(ngDevMode ? [{ debugName: "isFounderUser" }] : []));
        this.isInvestorUser = computed(() => this.matchesInvestor(this.clientType()), ...(ngDevMode ? [{ debugName: "isInvestorUser" }] : []));
        this.isBothUser = computed(() => this.isFounderUser() && this.isInvestorUser(), ...(ngDevMode ? [{ debugName: "isBothUser" }] : []));
        this.isFounderOnlyUser = computed(() => this.isFounderUser() && !this.isInvestorUser(), ...(ngDevMode ? [{ debugName: "isFounderOnlyUser" }] : []));
        this.isInvestorOnlyUser = computed(() => this.isInvestorUser() && !this.isFounderUser(), ...(ngDevMode ? [{ debugName: "isInvestorOnlyUser" }] : []));
        this.activeContext = computed(() => this.resolveActiveContext(), ...(ngDevMode ? [{ debugName: "activeContext" }] : []));
        this.isActiveFounderContext = computed(() => this.activeContext() === 'founder', ...(ngDevMode ? [{ debugName: "isActiveFounderContext" }] : []));
        this.isActiveInvestorContext = computed(() => this.activeContext() === 'investor', ...(ngDevMode ? [{ debugName: "isActiveInvestorContext" }] : []));
        this.canCreateOpportunity = computed(() => this.isActiveFounderContext(), ...(ngDevMode ? [{ debugName: "canCreateOpportunity" }] : []));
    }
    async ensureProfileLoaded() {
        if (!this.profileService.profile() && this.authService.isAuthenticated()) {
            await this.profileService.loadMyProfile();
        }
    }
    setActiveContext(context) {
        const normalized = this.normalizeContext(context);
        this.selectedContext.set(normalized);
        if (normalized) {
            localStorage.setItem('activeClientContext', normalized);
        }
        else {
            localStorage.removeItem('activeClientContext');
        }
        return this.resolveActiveContext();
    }
    clearActiveContext() {
        this.selectedContext.set(null);
        localStorage.removeItem('activeClientContext');
    }
    resolveActiveContext() {
        const selected = this.selectedContext() || this.normalizeContext(this.authService.userRole());
        return selected || 'investor';
    }
    matchesFounder(value) {
        const normalized = this.normalize(value);
        return normalized.includes('founder') || normalized.includes('both');
    }
    matchesInvestor(value) {
        const normalized = this.normalize(value);
        return normalized.includes('investor') || normalized.includes('partner') || normalized.includes('both');
    }
    normalize(value) {
        return (value || '').toString().trim().toLowerCase();
    }
    normalizeContext(value) {
        const normalized = this.normalize(value);
        if (normalized.includes('founder'))
            return 'founder';
        if (normalized.includes('investor') || normalized.includes('partner'))
            return 'investor';
        return null;
    }
    hasKnownCapability(value) {
        return this.matchesFounder(value) || this.matchesInvestor(value);
    }
    readStoredContext() {
        return this.normalizeContext(localStorage.getItem('activeClientContext'));
    }
    static { this.ɵfac = function RoleContextService_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || RoleContextService)(); }; }
    static { this.ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: RoleContextService, factory: RoleContextService.ɵfac, providedIn: 'root' }); }
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(RoleContextService, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], null, null); })();
