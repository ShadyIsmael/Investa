import { Injectable, signal, computed, inject, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_BASE } from '../config/api.token';
import { UserRoles } from '../config/constants';
import { ProfileService, UserProfile } from './profile.service';
import { AuthService } from './auth.service';
import { WalletService } from './wallet.service';

/**
 * User Service
 * 
 * Manages user state and credits
 * Integrates with ProfileService for user data
 * Handles credit transactions with proper API calls
 */
export interface User {
  userId: string;
  name: string;
  email: string;
  phoneNumber: string;
  role: string; // All external users are 'Client' type
  profileImageUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private profileService = inject(ProfileService);
  private authService = inject(AuthService);
  private walletService = inject(WalletService);

  private currentUser = signal<User | null>(null);
  private initialized = false;

  user = computed(() => this.currentUser());
  credits = this.walletService.balance;

  constructor(@Inject(API_BASE) private apiBase: string) {
  }

  /**
   * Initialize user from ProfileService
   * Waits for AuthService to validate token first
   */
  async initializeUser(): Promise<void> {
    if (this.initialized) return;

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
        } catch (error) {
          console.error('Failed to load platform CREDIT balance:', error);
          this.walletService.setBalance(0);
        }
      }
    } catch (error) {
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
  private setUserFromProfile(profile: UserProfile): void {
    const user: User = {
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
  async refreshUser(): Promise<void> {
    if (!this.authService.isAuthenticated()) {
      this.currentUser.set(null);
      this.walletService.setBalance(0);
      return;
    }

    const [profile] = await Promise.all([
      this.profileService.loadMyProfile(),
      this.walletService.loadBalance()
    ]);
    if (profile) this.setUserFromProfile(profile);
  }

  /**
   * Update user credits (local state only)
   * For actual credit transactions, use deductCredits or addCredits which call the API
   */
  private updateCredits(newAmount: number): void {
    this.walletService.setBalance(newAmount);
  }

  /**
   * Deduct credits from user account
   * Note: This updates local state. Backend API will handle the actual transaction
   * @returns new credit balance
   * @throws Error if insufficient credits
   */
  deductCredits(amount: number): number {
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
  addCredits(amount: number): number {
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
  setCredits(newAmount: number): void {
    this.updateCredits(newAmount);
  }

  /**
   * Get access token for API calls
   */
  private getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  /**
   * Clear user data (on logout)
   */
  clear(): void {
    this.currentUser.set(null);
    this.walletService.setBalance(0);
  }
}
