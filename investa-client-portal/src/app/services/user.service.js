import { Injectable, signal, computed, inject, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE } from '../config/api.token';
import { UserRoles } from '../config/constants';
import { ProfileService } from './profile.service';
import { AuthService } from './auth.service';
import { WalletService } from './wallet.service';
import * as i0 from "@angular/core";
export class UserService {
    constructor(apiBase) {
        this.apiBase = apiBase;
        this.http = inject(HttpClient);
        this.profileService = inject(ProfileService);
        this.authService = inject(AuthService);
        this.walletService = inject(WalletService);
        this.currentUser = signal(null, ...(ngDevMode ? [{ debugName: "currentUser" }] : []));
        this.initialized = false;
        this.user = computed(() => this.currentUser(), ...(ngDevMode ? [{ debugName: "user" }] : []));
        this.credits = this.walletService.balance;
    }
    /**
     * Initialize user from ProfileService
     * Waits for AuthService to validate token first
     */
    async initializeUser() {
        if (this.initialized)
            return;
        // Wait for AuthService to validate token
        await this.authService.initialize();
        // If not authenticated, clear user state
        if (!this.authService.isAuthenticated()) {
            this.currentUser.set(null);
            this.initialized = true;
            return;
        }
        try {
            const profile = await this.profileService.loadMyProfile();
            if (profile) {
                this.setUserFromProfile(profile);
                try {
                    await this.walletService.loadBalance();
                }
                catch (error) {
                    console.error('Failed to load platform CREDIT balance:', error);
                    this.walletService.setBalance(0);
                }
            }
        }
        catch (error) {
            // If profile load fails, clear auth state
            console.error('Failed to initialize user:', error);
            this.authService.logout();
            this.currentUser.set(null);
        }
        this.initialized = true;
    }
    /**
     * Map UserProfile to User model
     */
    setUserFromProfile(profile) {
        const user = {
            userId: profile.userId,
            name: profile.basicInfo?.fullName || profile.basicInfo?.firstName || 'User',
            email: profile.contactInfo?.email || profile.coreMetrics?.email || '',
            phoneNumber: profile.contactInfo?.phone1 || '',
            role: UserRoles.CLIENT, // All external users are Client type
            profileImageUrl: profile.basicInfo?.avatarUrl || undefined
        };
        this.currentUser.set(user);
    }
    /**
     * Reload user profile from API
     */
    async refreshUser() {
        if (!this.authService.isAuthenticated()) {
            this.currentUser.set(null);
            this.walletService.setBalance(0);
            return;
        }
        const [profile] = await Promise.all([
            this.profileService.loadMyProfile(),
            this.walletService.loadBalance()
        ]);
        if (profile)
            this.setUserFromProfile(profile);
    }
    /**
     * Update user credits (local state only)
     * For actual credit transactions, use deductCredits or addCredits which call the API
     */
    updateCredits(newAmount) {
        this.walletService.setBalance(newAmount);
    }
    /**
     * Deduct credits from user account
     * Note: This updates local state. Backend API will handle the actual transaction
     * @returns new credit balance
     * @throws Error if insufficient credits
     */
    deductCredits(amount) {
        if (!this.currentUser()) {
            throw new Error('User not loaded');
        }
        const currentBalance = this.credits();
        if (currentBalance < amount) {
            throw new Error('Insufficient credits');
        }
        const newBalance = currentBalance - amount;
        this.updateCredits(newBalance);
        return newBalance;
    }
    /**
     * Add credits to user account (local state)
     * Backend API handles actual credit addition with audit trail
     */
    addCredits(amount) {
        if (!this.currentUser()) {
            throw new Error('User not loaded');
        }
        const newBalance = this.credits() + amount;
        this.updateCredits(newBalance);
        return newBalance;
    }
    /**
     * Set user credits to an exact amount (local state only)
     * Useful when backend returns the new balance in a response
     */
    setCredits(newAmount) {
        this.updateCredits(newAmount);
    }
    /**
     * Get access token for API calls
     */
    getAccessToken() {
        return localStorage.getItem('accessToken');
    }
    /**
     * Clear user data (on logout)
     */
    clear() {
        this.currentUser.set(null);
        this.walletService.setBalance(0);
    }
    static { this.ɵfac = function UserService_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || UserService)(i0.ɵɵinject(API_BASE)); }; }
    static { this.ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: UserService, factory: UserService.ɵfac, providedIn: 'root' }); }
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(UserService, [{
        type: Injectable,
        args: [{
                providedIn: 'root'
            }]
    }], () => [{ type: undefined, decorators: [{
                type: Inject,
                args: [API_BASE]
            }] }], null); })();
